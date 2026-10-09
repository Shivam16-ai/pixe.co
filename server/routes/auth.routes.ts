import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { prisma } from '../db';
import {
  AuthenticatedRequest,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from '../middleware/auth';

export const authRouter = Router();

const GOOGLE_STATE_COOKIE = 'pixe_google_oauth_state';
const GOOGLE_CALLBACK_PATH = '/api/auth/google/callback';
const GOOGLE_STATE_TTL_MS = 10 * 60 * 1000;

type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    return null;
  }

  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackUrl: GOOGLE_CALLBACK_URL,
  };
}

function oauthFailureRedirect(res: Response, reason: string): void {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    res.redirect(`/login?google=error&reason=${encodeURIComponent(reason)}`);
    return;
  }

  try {
    const redirectUrl = new URL('/login', frontendUrl);
    redirectUrl.searchParams.set('google', 'error');
    redirectUrl.searchParams.set('reason', reason);
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Invalid FRONTEND_URL for Google OAuth redirect:', error);
    res.redirect(`/login?google=error&reason=${encodeURIComponent(reason)}`);
  }
}

function oauthSuccessRedirect(res: Response): void {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    res.redirect('/login?google=success');
    return;
  }

  try {
    const redirectUrl = new URL('/login', frontendUrl);
    redirectUrl.searchParams.set('google', 'success');
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Invalid FRONTEND_URL for Google OAuth redirect:', error);
    res.redirect('/login?google=success');
  }
}

authRouter.get('/google', (req, res) => {
  const googleConfig = getGoogleOAuthConfig();
  if (!googleConfig) {
    return res.status(503).json({
      success: false,
      message: 'Google sign-in is not configured on the server.',
    });
  }

  const state = randomBytes(32).toString('hex');
  res.cookie(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: GOOGLE_STATE_TTL_MS,
    path: GOOGLE_CALLBACK_PATH,
  });

  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorizationUrl.searchParams.set('client_id', googleConfig.clientId);
  authorizationUrl.searchParams.set('redirect_uri', googleConfig.callbackUrl);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid email profile');
  authorizationUrl.searchParams.set('state', state);

  return res.redirect(authorizationUrl.toString());
});

authRouter.get('/google/callback', async (req, res) => {
  const googleConfig = getGoogleOAuthConfig();
  const storedState = req.cookies?.[GOOGLE_STATE_COOKIE];
  const returnedState = typeof req.query.state === 'string' ? req.query.state : '';

  res.clearCookie(GOOGLE_STATE_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: GOOGLE_CALLBACK_PATH,
  });

  if (!googleConfig) {
    return oauthFailureRedirect(res, 'not_configured');
  }

  if (req.query.error || !req.query.code || !storedState || !returnedState) {
    return oauthFailureRedirect(res, 'cancelled');
  }

  const storedStateBuffer = Buffer.from(storedState);
  const returnedStateBuffer = Buffer.from(returnedState);
  if (
    storedStateBuffer.length !== returnedStateBuffer.length ||
    !timingSafeEqual(storedStateBuffer, returnedStateBuffer)
  ) {
    return oauthFailureRedirect(res, 'invalid_state');
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(req.query.code),
        client_id: googleConfig.clientId,
        client_secret: googleConfig.clientSecret,
        redirect_uri: googleConfig.callbackUrl,
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenResponse.ok) {
      console.error('Google OAuth token exchange failed:', tokenResponse.status);
      return oauthFailureRedirect(res, 'token_exchange');
    }

    const tokens = (await tokenResponse.json()) as { access_token?: string };
    if (!tokens.access_token) {
      console.error('Google OAuth token response did not include an access token.');
      return oauthFailureRedirect(res, 'token_exchange');
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!profileResponse.ok) {
      console.error('Google OAuth profile request failed:', profileResponse.status);
      return oauthFailureRedirect(res, 'profile');
    }

    const profile = (await profileResponse.json()) as {
      id?: string;
      email?: string;
      verified_email?: boolean;
      name?: string;
      picture?: string;
    };

    if (
      !profile.id ||
      !profile.email ||
      profile.verified_email !== true ||
      typeof profile.name !== 'string'
    ) {
      return oauthFailureRedirect(res, 'unverified_email');
    }

    const normalizedEmail = profile.email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user?.role === 'ADMIN') {
      return oauthFailureRedirect(res, 'admin_account');
    }

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            name: profile.name.trim() || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
            role: 'CUSTOMER',
            avatar: profile.picture,
            cart: { create: {} },
          },
        });
      } catch (error) {
        if (
          !error ||
          typeof error !== 'object' ||
          !('code' in error) ||
          error.code !== 'P2002'
        ) {
          throw error;
        }

        user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user || user.role === 'ADMIN') {
          return oauthFailureRedirect(res, 'account');
        }
      }
    }

    const existingCart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!existingCart) {
      await prisma.cart.create({ data: { userId: user.id } });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    setAuthCookie(res, token);

    return oauthSuccessRedirect(res);
  } catch (error) {
    console.error('Google OAuth callback failed:', error);
    return oauthFailureRedirect(res, 'authentication');
  }
});

/**
 * POST /api/auth/register
 * Customer registration with password hashing
 */
authRouter.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Hash password with salt 10
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with default CUSTOMER role
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'CUSTOMER',
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });

    // Generate JWT & set HTTP-only cookie
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.toLowerCase(),
        avatar: newUser.avatar,
        phone: newUser.phone,
        memberSince: newUser.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating darkroom account.',
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
authRouter.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No collector profile found with this email.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.',
      });
    }

    // Ensure cart exists
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      await prisma.cart.create({ data: { userId: user.id } });
    }

    // Generate token & set cookie
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Authenticated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(), // 'customer' or 'admin'
        avatar: user.avatar,
        phone: user.phone,
        memberSince: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
});

/**
 * GET /api/auth/me
 * Returns currently authenticated user
 */
authRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated.',
      user: null,
    });
  }

  return res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role.toLowerCase(),
      avatar: req.user.avatar,
      phone: req.user.phone,
    },
  });
});

/**
 * POST /api/auth/logout
 * Clears cookie
 */
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  clearAuthCookie(res);
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});
