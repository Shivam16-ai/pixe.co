import React, { useState } from 'react';
import { PageView } from '../types';
import { playPaperTapSound, playShutterSound } from '../utils/audio';
import { Check, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    playShutterSound();
    setSubscribed(true);
    setTimeout(() => {
      setEmailInput('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="relative bg-[#070605] border-t border-[#1C1A15] text-[#E8DDC8]/70 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Studio Note */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => {
                playPaperTapSound();
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left font-['Syne'] text-2xl font-bold text-[#E8DDC8] hover:text-[#F4B82A] transition-colors cursor-pointer"
            >
              PIXÉ<span className="text-[#F4B82A]">.</span>CO
            </button>
            <p className="text-xs text-[#E8DDC8]/60 leading-relaxed max-w-sm font-light">
              Crafting archival instant photographic prints from digital memories. Archival 310gsm paper stock, thermal dye sublimation, and hand-inspected studio finishing.
            </p>
            <div className="font-['Caveat'] text-lg text-[#F4B82A]">
              "Turn moments into something you can hold."
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-[#E8DDC8] uppercase tracking-wider font-semibold">
              Curated Worlds
            </div>
            <ul className="space-y-2 text-xs">
              {['Anime', 'Heroes', 'Movies', 'F1 Racing', 'Vintage Cars', 'Café Bikes', 'Literary Quotes', 'Retro Games'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      playPaperTapSound();
                      onNavigate('home');
                      setTimeout(() => {
                        const el = document.getElementById('categories-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-[#F4B82A] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Links */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-[#E8DDC8] uppercase tracking-wider font-semibold">
              Studio
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    playPaperTapSound();
                    onNavigate('custom');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#F4B82A] transition-colors cursor-pointer"
                >
                  Customizer Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playPaperTapSound();
                    onNavigate('home');
                    setTimeout(() => {
                      const el = document.getElementById('pricing-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-[#F4B82A] transition-colors cursor-pointer"
                >
                  Print Plans & Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playPaperTapSound();
                    onNavigate('home');
                    setTimeout(() => {
                      const el = document.getElementById('process-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-[#F4B82A] transition-colors cursor-pointer"
                >
                  Documentary Process
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playPaperTapSound();
                    onNavigate('login');
                  }}
                  className="hover:text-[#F4B82A] transition-colors cursor-pointer"
                >
                  Collector Account
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Dispatch Newsletter */}
          <div className="space-y-3">
            <div className="font-mono text-xs text-[#E8DDC8] uppercase tracking-wider font-semibold">
              Studio Dispatches
            </div>
            <p className="text-[11px] text-[#E8DDC8]/60 font-light">
              Receive limited Polaroid drop notifications and analog photography zines.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@studio.com"
                  className="w-full px-3 py-2 bg-[#12100E] border border-[#27241D] focus:border-[#F4B82A] rounded-lg text-xs text-[#E8DDC8] outline-none pr-8"
                />
                <Mail className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-[#E8DDC8]/40 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#1E1B15] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] font-semibold text-xs tracking-wider uppercase rounded-lg border border-[#27241D] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SUBSCRIBED</span>
                  </>
                ) : (
                  <span>JOIN DISPATCH</span>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Quiet details */}
        <div className="mt-12 pt-8 border-t border-[#1C1A15] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#E8DDC8]/50 font-mono">
          <div>
            © {new Date().getFullYear()} PIXÉ.CO Photographic Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>3.5 × 4.2" ARCHIVAL FORMAT</span>
            <span>·</span>
            <span>DOMESTIC & GLOBAL DISPATCH</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
