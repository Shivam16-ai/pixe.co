import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

export const AUTH_COOKIE_NAME = 'pixe_auth_token';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in your environment before starting PIXÉ.CO.');
}

const jwtSecret: string = JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';
const cookieSameSite = isProduction ? 'none' : 'lax';

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: cookieSameSite as 'lax' | 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string | null;
  phone?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function signToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getCookieOptions(),
    expires: new Date(0),
  });
}

export async function extractUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as unknown as {
      id: string;
      email: string;
      role: string;
    };

    if (decoded && decoded.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
        },
      });

      if (dbUser) {
        req.user = {
          ...dbUser,
          role: dbUser.role as 'CUSTOMER' | 'ADMIN',
        };
      }
    }
  } catch {
    // Invalid token, proceed without authenticated user
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to your PIXÉ darkroom account.',
    });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in with darkroom credentials.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Darkroom administrative privileges required.',
    });
  }

  next();
}

export function requireCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }
  next();
}
