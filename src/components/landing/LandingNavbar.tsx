import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, toggleSound, playPaperTapSound } from '../../utils/audio';

interface LandingNavbarProps {
  onEnterApp: () => void;
  onLoginClick: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onEnterApp,
  onLoginClick,
  onScrollToSection,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3.5 bg-[#0B0A08]/90 backdrop-blur-md border-b border-[#27241D]/80 shadow-xl'
          : 'py-6 bg-gradient-to-b from-[#0B0A08]/90 via-[#0B0A08]/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#F4B82A]"
            aria-label="PIXÉ.CO Brand Home"
          >
            <span className="font-['Syne'] text-xl sm:text-2xl font-bold tracking-tight text-[#E8DDC8] group-hover:text-[#F4B82A] transition-colors">
              PIXÉ<span className="text-[#F4B82A]">.</span>CO
            </span>
          </button>

          {/* Zone 2: Minimal Public Marketing Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-[#E8DDC8]/80">
            <button
              onClick={() => onScrollToSection('about-section')}
              className="hover:text-[#F4B82A] transition-colors cursor-pointer py-1"
            >
              ABOUT
            </button>
            <button
              onClick={() => onScrollToSection('story-visuals-section')}
              className="hover:text-[#F4B82A] transition-colors cursor-pointer py-1"
            >
              HOW IT WORKS
            </button>
            <button
              onClick={() => onScrollToSection('why-section')}
              className="hover:text-[#F4B82A] transition-colors cursor-pointer py-1"
            >
              WHY PIXÉ
            </button>
            <button
              onClick={onLoginClick}
              className="hover:text-[#F4B82A] transition-colors cursor-pointer py-1"
            >
              LOGIN
            </button>
          </nav>

          {/* Zone 3: Primary Action: ENTER PIXÉ.CO */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundOn ? 'Sound effects on' : 'Sound effects muted'}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-[#27241D] text-[#E8DDC8]/60 hover:text-[#F4B82A] transition-colors cursor-pointer"
              title={soundOn ? 'Studio Shutter Audio: On' : 'Studio Shutter Audio: Muted'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#F4B82A]" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onEnterApp}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <span>ENTER PIXÉ.CO</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-md text-[#E8DDC8] hover:text-[#F4B82A] focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0A08] border-b border-[#27241D] px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-semibold tracking-wider uppercase text-[#E8DDC8]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToSection('about-section');
              }}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              ABOUT PIXÉ.CO
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToSection('story-visuals-section');
              }}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              HOW IT WORKS
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToSection('why-section');
              }}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              WHY PIXÉ
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginClick();
              }}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              LOGIN TO STUDIO
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterApp();
                }}
                className="w-full py-3 bg-[#F4B82A] text-[#0B0A08] text-xs font-bold uppercase tracking-wider rounded-lg text-center"
              >
                ENTER PIXÉ.CO →
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
