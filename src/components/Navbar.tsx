import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { PageView } from '../types';
import { isSoundEnabled, toggleSound, playPaperTapSound } from '../utils/audio';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  cartCount: number;
  onOpenCart: () => void;
  isLoggedIn?: boolean;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  onOpenCart,
  isLoggedIn = false,
  userName = 'Collector',
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

  const handleNavClick = (page: PageView, sectionId?: string) => {
    playPaperTapSound();
    setMobileMenuOpen(false);
    if (page === 'home' && sectionId) {
      if (currentPage !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3.5 bg-[#0B0A08]/90 backdrop-blur-md border-b border-[#27241D]/80 shadow-xl'
          : 'py-6 bg-gradient-to-b from-[#0B0A08]/90 via-[#0B0A08]/50 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="group flex items-center text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#F4B82A]"
            aria-label="PIXÉ.CO Home"
          >
            <span className="font-['Syne'] text-xl sm:text-2xl font-bold tracking-tight text-[#E8DDC8] group-hover:text-[#F4B82A] transition-colors">
              PIXÉ<span className="text-[#F4B82A]">.</span>CO
            </span>
          </button>

          {/* Zone 2: Clean 4-6 text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-[#E8DDC8]/80">
            <button
              onClick={() => handleNavClick('home', 'categories-section')}
              className="hover:text-[#F4B82A] transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#F4B82A] hover:after:w-full after:transition-all"
            >
              SHOP
            </button>
            <button
              onClick={() => handleNavClick('custom')}
              className={`hover:text-[#F4B82A] transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#F4B82A] hover:after:w-full after:transition-all ${
                currentPage === 'custom' ? 'text-[#F4B82A] after:w-full' : ''
              }`}
            >
              CUSTOM
            </button>
            <button
              onClick={() => handleNavClick('home', 'pricing-section')}
              className="hover:text-[#F4B82A] transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#F4B82A] hover:after:w-full after:transition-all"
            >
              PRINTS
            </button>
            <button
              onClick={() => handleNavClick('home', 'story-section')}
              className="hover:text-[#F4B82A] transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#F4B82A] hover:after:w-full after:transition-all"
            >
              ABOUT
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Tactile Audio Shutter Sound Switcher */}
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundOn ? 'Sound effects active' : 'Sound effects muted'}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-[#27241D] text-[#E8DDC8]/60 hover:text-[#F4B82A] hover:border-[#F4B82A]/30 transition-colors cursor-pointer"
              title={soundOn ? 'Camera Shutter Sound: Enabled' : 'Camera Shutter Sound: Muted'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#F4B82A]" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Login / Profile Action */}
            <button
              onClick={() => handleNavClick('login')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                currentPage === 'login'
                  ? 'bg-[#F4B82A] text-[#0B0A08] border-[#F4B82A] font-semibold'
                  : 'bg-[#141310] text-[#E8DDC8] border-[#27241D] hover:border-[#F4B82A]/50 hover:text-[#F4B82A]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? userName.split(' ')[0] : 'LOGIN'}</span>
            </button>

            {/* Cart Action */}
            <button
              onClick={onOpenCart}
              aria-label="View shopping cart"
              className="relative flex items-center justify-center p-2 rounded-md bg-[#141310] border border-[#27241D] text-[#E8DDC8] hover:text-[#F4B82A] hover:border-[#F4B82A]/50 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F4B82A] text-[#0B0A08] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0A08] border-b border-[#27241D] px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-semibold tracking-wider uppercase text-[#E8DDC8]">
            <button
              onClick={() => handleNavClick('home', 'categories-section')}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              SHOP POLAROIDS
            </button>
            <button
              onClick={() => handleNavClick('custom')}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              CREATE CUSTOM
            </button>
            <button
              onClick={() => handleNavClick('home', 'pricing-section')}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              PRINT PLANS & PRICING
            </button>
            <button
              onClick={() => handleNavClick('home', 'story-section')}
              className="text-left py-2 hover:text-[#F4B82A] transition-colors border-b border-[#1A1814]"
            >
              ABOUT PIXÉ STUDIO
            </button>
            <div className="pt-2 flex items-center justify-between text-xs text-[#E8DDC8]/60">
              <span>CAMERA SOUND FX</span>
              <button
                type="button"
                onClick={handleToggleSound}
                className="px-2.5 py-1 rounded bg-[#141310] border border-[#27241D] text-[#F4B82A]"
              >
                {soundOn ? 'SOUND ON' : 'MUTED'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
