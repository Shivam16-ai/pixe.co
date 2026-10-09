import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Mail, User, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { VideoScenePlayer } from '../VideoScenePlayer';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';
import { UserSession } from '../../types';
import { authApi } from '../../lib/api';

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

const DEMO_CREDENTIALS = {
  customer: {
    email: 'collector@pixe.co',
    password: 'archival2026!',
  },
  admin: {
    email: 'admin@pixe.co',
    password: '',
  },
} as const;

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const applyDemoCredentials = (role: 'customer' | 'admin') => {
    setTargetRole(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
  };

  // Login form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Target role for testing
  const [targetRole, setTargetRole] = useState<'customer' | 'admin'>('customer');

  // Animation states
  const [authStatus, setAuthStatus] = useState<'idle' | 'authenticating' | 'success'>('idle');
  const [authMessage, setAuthMessage] = useState('');

  const executeLogin = async (role: 'customer' | 'admin', userName: string, userEmail: string) => {
    playShutterSound();
    setAuthStatus('authenticating');
    setAuthMessage('AUTHENTICATING CREDENTIALS...');

    try {
      const session = await authApi.login({ email: userEmail, password: password || signupPassword });
      if (!session) {
        throw new Error('Authentication failed.');
      }

      setAuthStatus('success');
      setAuthMessage(
        session.role === 'admin'
          ? 'AUTHENTICATED. OPENING DARKROOM ADMIN PORTAL...'
          : 'AUTHENTICATED. OPENING CUSTOMER PORTAL...'
      );
      playShutterSound();

      setTimeout(() => {
        onLoginSuccess({
          role: session.role,
          name: session.name || userName,
          email: session.email || userEmail,
          memberSince: session.memberSince,
          avatar: session.avatar,
        });
      }, 1100);
    } catch (error) {
      setAuthStatus('idle');
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      setAuthMessage(message);
      setTimeout(() => setAuthMessage(''), 2200);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      await executeLogin(targetRole, email.split('@')[0] || 'Collector', email);
      return;
    }

    if (!signupName || !signupEmail || !signupPassword) {
      setAuthMessage('Please complete all registration fields.');
      setTimeout(() => setAuthMessage(''), 2200);
      return;
    }

    try {
      setAuthStatus('authenticating');
      setAuthMessage('CREATING YOUR DARKROOM ACCOUNT...');
      const session = await authApi.register({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      if (!session) {
        throw new Error('Registration failed.');
      }

      setAuthStatus('success');
      setAuthMessage('ACCOUNT CREATED. OPENING CUSTOMER PORTAL...');
      playShutterSound();
      setTimeout(() => {
        onLoginSuccess({
          role: session.role,
          name: session.name || signupName,
          email: session.email || signupEmail,
          memberSince: session.memberSince,
          avatar: session.avatar,
        });
      }, 1100);
    } catch (error) {
      setAuthStatus('idle');
      const message = error instanceof Error ? error.message : 'Unable to register account.';
      setAuthMessage(message);
      setTimeout(() => setAuthMessage(''), 2200);
    }
  };

  const handleGoogleLogin = async () => {
    const demoCustomer = DEMO_CREDENTIALS.customer;
    setEmail(demoCustomer.email);
    setPassword(demoCustomer.password);
    await executeLogin('customer', 'Google Collector', demoCustomer.email);
  };

  return (
    <div className="relative min-h-screen bg-[#080706] text-[#E8DDC8] flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* Background Studio Surface */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(244,184,42,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 film-grain opacity-30 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playPaperTapSound();
            onBackToLanding();
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8DDC8]/70 hover:text-[#F4B82A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO PUBLIC WEBSITE</span>
        </button>

        <span className="font-['Syne'] text-xl font-bold tracking-tight text-[#E8DDC8]">
          PIXÉ<span className="text-[#F4B82A]">.</span>CO
        </span>
      </header>

      {/* Split Screen Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Real-life Photography Video Scene */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F4B82A] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#F4B82A] animate-pulse" />
                <span>STUDIO AUTHENTICATION · REAL-WORLD FOOTAGE</span>
              </div>
              <h1 className="font-['Syne'] text-3xl sm:text-5xl font-bold text-[#E8DDC8] leading-tight">
                WELCOME BACK.
              </h1>
              <p className="font-['Cormorant_Garamond'] italic text-2xl text-[#E8DDC8]/80">
                Step into your PIXÉ.CO experience.
              </p>
            </div>

            {/* Video Player Component */}
            <div className="relative">
              <div className="absolute -top-3.5 right-8 w-28 h-6 washi-tape rotate-2 z-20" />
              
              <VideoScenePlayer
                sceneId="AUTH · DESK SCENE"
                title="DARK DESK POLAROID RETRIEVAL"
                sceneDescription="Subtle real-life footage: A Polaroid photograph lies on a dark slate table. Camera slowly approaches. A hand gently lifts the print to unlock access to the studio."
                posterSrc="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80"
                focalLength="35mm f/1.8 Prime"
                cameraModel="Sony FX3 Cinema Rig"
                aspectRatio="16:9"
              />
            </div>

            {/* Authentication Protocol Badge */}
            <div className="p-4 rounded-xl bg-[#12100E] border border-[#27241D] flex items-center justify-between text-xs text-[#E8DDC8]/60 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F4B82A]" />
                <span>STUDIO ACCESS DISPATCH</span>
              </span>
              <span className="text-[#F4B82A]">ENCRYPTED SESSION</span>
            </div>
          </div>

          {/* Right Side: Clean Photography-Inspired Login Panel */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-[#14120E] border border-[#27241D] rounded-2xl p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.95)] relative overflow-hidden">
              
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape -rotate-1 z-20 flex items-center justify-center text-[9px] font-mono tracking-widest uppercase text-black/60 font-bold">
                PIXÉ ID
              </div>

              {/* Mode Toggle Switch */}
              <div className="flex items-center gap-1 p-1 bg-[#0E0D0B] rounded-lg border border-[#27241D] mb-5">
                <button
                  type="button"
                  onClick={() => {
                    playPaperTapSound();
                    setMode('login');
                    setAuthStatus('idle');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    mode === 'login' ? 'bg-[#F4B82A] text-[#0B0A08]' : 'text-[#E8DDC8]/60 hover:text-[#E8DDC8]'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playPaperTapSound();
                    setMode('signup');
                    setAuthStatus('idle');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    mode === 'signup' ? 'bg-[#F4B82A] text-[#0B0A08]' : 'text-[#E8DDC8]/60 hover:text-[#E8DDC8]'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* Quick Role Selector (Convenient testing for Customer vs Admin) */}
              <div className="mb-5 p-2 rounded-lg bg-[#0E0D0B] border border-[#27241D] flex items-center justify-between text-xs">
                <span className="font-mono text-[#E8DDC8]/60 text-[11px]">DEMO ROLE:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playPaperTapSound();
                      applyDemoCredentials('customer');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      targetRole === 'customer'
                        ? 'bg-[#1E1B15] text-[#F4B82A] border border-[#F4B82A]/40'
                        : 'text-[#E8DDC8]/50 hover:text-[#E8DDC8]'
                    }`}
                  >
                    Customer Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playPaperTapSound();
                      applyDemoCredentials('admin');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      targetRole === 'admin'
                        ? 'bg-[#1E1B15] text-[#F4B82A] border border-[#F4B82A]/40'
                        : 'text-[#E8DDC8]/50 hover:text-[#E8DDC8]'
                    }`}
                  >
                    Admin Portal
                  </button>
                </div>
              </div>

              {/* Status Message Overlay */}
              {authStatus !== 'idle' ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                  {authStatus === 'authenticating' ? (
                    <div className="w-12 h-12 rounded-full border-2 border-[#27241D] border-t-[#F4B82A] animate-spin" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F4B82A] text-[#0B0A08] flex items-center justify-center shadow-lg animate-bounce">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                  )}

                  <div className="font-['Syne'] text-lg sm:text-xl font-bold text-[#E8DDC8] tracking-wide">
                    {authMessage}
                  </div>
                  <div className="text-xs text-[#E8DDC8]/50 font-mono">
                    Routing to designated portal workspace...
                  </div>
                </div>
              ) : mode === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                      EMAIL / USER ID
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="collector@pixe.co"
                        className="w-full px-3.5 py-3 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] focus:ring-1 focus:ring-[#F4B82A]/30 rounded-xl text-sm text-[#E8DDC8] outline-none pl-10 transition-all"
                      />
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#E8DDC8]/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset simulation link sent to email.')}
                        className="text-[11px] text-[#F4B82A] hover:underline cursor-pointer font-mono"
                      >
                        FORGOT PASSWORD?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-3 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] focus:ring-1 focus:ring-[#F4B82A]/30 rounded-xl text-sm text-[#E8DDC8] outline-none pl-10 pr-10 transition-all"
                      />
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#E8DDC8]/40 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-[#E8DDC8]/40 hover:text-[#E8DDC8] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer mt-2 active:scale-[0.98]"
                  >
                    LOGIN
                  </button>

                  <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#27241D]" />
                    </div>
                    <span className="relative bg-[#14120E] px-3 text-[10px] font-mono text-[#E8DDC8]/40 uppercase tracking-widest">
                      OR
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-[#0A0908] hover:bg-[#1A1813] text-[#E8DDC8] border border-[#27241D] hover:border-[#F4B82A]/50 font-semibold text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                    <span>CONTINUE WITH GOOGLE</span>
                  </button>
                </form>
              ) : (
                /* CREATE ACCOUNT FORM */
                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                      NAME
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Elena Vance"
                        className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-xl text-sm text-[#E8DDC8] outline-none pl-10"
                      />
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-[#E8DDC8]/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                      EMAIL
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="elena@studio.com"
                        className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-xl text-sm text-[#E8DDC8] outline-none pl-10"
                      />
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#E8DDC8]/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-xl text-sm text-[#E8DDC8] outline-none pl-10"
                      />
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#E8DDC8]/40 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer mt-2 active:scale-[0.98]"
                  >
                    CREATE ACCOUNT
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-20 py-6 text-center text-xs text-[#E8DDC8]/40 font-mono">
        PIXÉ.CO ARCHIVAL POLAROID PRINTING STUDIO · STRICT ROLE-BASED ACCESS
      </footer>

    </div>
  );
};
