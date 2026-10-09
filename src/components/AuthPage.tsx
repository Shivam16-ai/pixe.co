import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { VideoScenePlayer } from './VideoScenePlayer';
import { playPaperTapSound, playShutterSound } from '../utils/audio';

interface AuthPageProps {
  onBackToHome: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToHome, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Mock interaction state
  const [authStatus, setAuthStatus] = useState<'idle' | 'authenticating' | 'success'>('idle');
  const [authMessage, setAuthMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    playShutterSound();
    setAuthStatus('authenticating');
    setAuthMessage('AUTHENTICATING...');

    setTimeout(() => {
      setAuthStatus('success');
      setAuthMessage('WELCOME BACK, COLLECTOR.');
      playShutterSound();

      setTimeout(() => {
        onLoginSuccess({
          name: loginEmail.split('@')[0],
          email: loginEmail,
        });
        onBackToHome();
      }, 1200);
    }, 1500);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) return;

    playShutterSound();
    setAuthStatus('authenticating');
    setAuthMessage('INITIALIZING PIXÉ ACCOUNT...');

    setTimeout(() => {
      setAuthStatus('success');
      setAuthMessage(`ACCOUNT CREATED. WELCOME ${signupName.toUpperCase()}!`);
      playShutterSound();

      setTimeout(() => {
        onLoginSuccess({
          name: signupName,
          email: signupEmail,
        });
        onBackToHome();
      }, 1200);
    }, 1500);
  };

  const handleGoogleMock = () => {
    playShutterSound();
    setAuthStatus('authenticating');
    setAuthMessage('CONNECTING SECURE SESSION...');
    setTimeout(() => {
      setAuthStatus('success');
      setAuthMessage('VERIFIED VIA GOOGLE.');
      playShutterSound();
      setTimeout(() => {
        onLoginSuccess({
          name: 'Polaroid Collector',
          email: 'collector@gmail.com',
        });
        onBackToHome();
      }, 1200);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#080706] text-[#E8DDC8] flex flex-col justify-between overflow-x-hidden">
      
      {/* Studio Lighting Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(244,184,42,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 film-grain opacity-30 pointer-events-none" />

      {/* Top Bar for Auth Page */}
      <header className="relative z-20 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playPaperTapSound();
            onBackToHome();
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8DDC8]/70 hover:text-[#F4B82A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO STUDIO</span>
        </button>

        <span className="font-['Syne'] text-xl font-bold tracking-tight text-[#E8DDC8]">
          PIXÉ<span className="text-[#F4B82A]">.</span>CO
        </span>
      </header>

      {/* Main Split-Screen Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Real-Life Cinematic Videography Experience */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F4B82A] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#F4B82A] animate-pulse" />
                <span>STUDIO CINEMATOGRAPHY · ARCHIVAL LOGIN</span>
              </div>
              <h1 className="font-['Syne'] text-3xl sm:text-5xl font-bold text-[#E8DDC8] leading-tight">
                {mode === 'login' ? 'WELCOME BACK.' : 'JOIN THE ARCHIVE.'}
              </h1>
              <p className="font-['Cormorant_Garamond'] italic text-2xl text-[#E8DDC8]/80">
                {mode === 'login' ? 'Your memories are waiting.' : 'Craft personal prints from tangible emulsion.'}
              </p>
            </div>

            {/* Video Player Component for Login scene */}
            <div className="relative">
              {/* Studio tape pinned to video */}
              <div className="absolute -top-3.5 right-8 w-28 h-6 washi-tape rotate-2 z-20" />
              
              <VideoScenePlayer
                sceneId="AUTH · SCENE 08"
                title="STUDIO DESK RETRIEVAL"
                sceneDescription="Macro footage: A physical Polaroid rests on a dark slate desk under warm tungsten rim light. A hand enters frame and gently lifts the print to reveal the collector vault."
                posterSrc="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80"
                focalLength="35mm f/1.8 Macro"
                cameraModel="Sony FX3 · 3200K Tungsten"
                aspectRatio="16:9"
              />
            </div>

            {/* Authenticity Testimonial */}
            <div className="p-4 rounded-xl bg-[#12100E] border border-[#27241D] flex items-center justify-between text-xs text-[#E8DDC8]/60 font-mono">
              <span>EXIF: 4K 24FPS DCI · PRORES 422</span>
              <span className="text-[#F4B82A]">VAULT PASS: SECURED</span>
            </div>
          </div>

          {/* Right Column: Floating Polaroid-Style Login & Registration Panel */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-[#14120E] border border-[#27241D] rounded-2xl p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.95)] relative overflow-hidden">
              
              {/* Washi Tape on card top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape -rotate-1 z-20 flex items-center justify-center text-[9px] font-mono tracking-widest uppercase text-black/60 font-bold">
                PIXÉ ID
              </div>

              {/* Mode Toggle Switch (Segmented buttons) */}
              <div className="flex items-center gap-1 p-1 bg-[#0E0D0B] rounded-lg border border-[#27241D] mb-6">
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

              {/* Auth Status Overlay */}
              {authStatus !== 'idle' ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                  {authStatus === 'authenticating' ? (
                    <div className="w-12 h-12 rounded-full border-2 border-[#27241D] border-t-[#F4B82A] animate-spin" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F4B82A] text-[#0B0A08] flex items-center justify-center shadow-lg animate-bounce">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                  )}

                  <div className="font-['Syne'] text-xl font-bold text-[#E8DDC8] tracking-wide">
                    {authMessage}
                  </div>
                  <div className="text-xs text-[#E8DDC8]/50 font-mono">
                    {authStatus === 'authenticating'
                      ? 'Simulating cryptographic collector authentication...'
                      : 'Redirecting to your creative studio workspace...'}
                  </div>
                </div>
              ) : mode === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="collector@polaroid.co"
                        className="w-full px-3.5 py-3 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] focus:ring-1 focus:ring-[#F4B82A]/30 rounded-xl text-sm text-[#E8DDC8] outline-none pl-10 transition-all"
                      />
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#E8DDC8]/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                        Password
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
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer mt-2 active:scale-[0.98]"
                  >
                    LOGIN TO STUDIO
                  </button>

                  {/* Divider */}
                  <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#27241D]" />
                    </div>
                    <span className="relative bg-[#14120E] px-3 text-[10px] font-mono text-[#E8DDC8]/40 uppercase tracking-widest">
                      OR CONTINUE WITH
                    </span>
                  </div>

                  {/* Google OAuth Mock Button */}
                  <button
                    type="button"
                    onClick={handleGoogleMock}
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
                /* SIGNUP FORM */
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                      Full Name
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
                      Email Address
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
                      Password
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

                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full px-3.5 py-2.5 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-xl text-sm text-[#E8DDC8] outline-none pl-10"
                      />
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#E8DDC8]/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Submit Signup Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer mt-2 active:scale-[0.98]"
                  >
                    CREATE PIXÉ ACCOUNT
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer quiet note */}
      <footer className="relative z-20 py-6 text-center text-xs text-[#E8DDC8]/40 font-mono">
        PIXÉ.CO ARCHIVAL POLAROID PRINTING STUDIO · ZERO THIRD-PARTY COOKIES
      </footer>
    </div>
  );
};
