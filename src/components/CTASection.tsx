import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { playPaperTapSound, playShutterSound } from '../utils/audio';

interface CTASectionProps {
  onShopClick: () => void;
  onCreateCustomClick: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({
  onShopClick,
  onCreateCustomClick,
}) => {
  return (
    <section className="relative py-32 bg-[#080706] border-t border-[#1C1A15] overflow-hidden select-none">
      {/* Background Cinematic Studio Desk Layer */}
      <div className="absolute inset-0 opacity-25">
        <img
          src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1600&q=80"
          alt="Dark photography studio background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter contrast-125 brightness-75 scale-105"
        />
      </div>

      {/* Atmospheric Studio Fog & Tungsten Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-[#080706]/85 to-[#080706]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(244,184,42,0.12),transparent_70%)]" />
      <div className="absolute inset-0 film-grain opacity-40 pointer-events-none" />

      {/* Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
        
        {/* Editorial Subtitle */}
        <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
          <span className="w-8 h-[1px] bg-[#F4B82A]" />
          <span>Real Film · Tangible Craft</span>
          <span className="w-8 h-[1px] bg-[#F4B82A]" />
        </div>

        {/* Primary Callout Statement */}
        <h2 className="font-['Syne'] text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#E8DDC8] leading-[1.05] text-balance">
          YOUR NEXT MEMORY <br />
          <span className="text-white">DESERVES A</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4B82A] via-[#FCE39E] to-[#F4B82A] italic font-['Cormorant_Garamond'] font-normal">
            Polaroid.
          </span>
        </h2>

        {/* Handwritten Accent */}
        <p className="font-['Caveat'] text-2xl sm:text-3xl text-[#F4B82A] max-w-lg mx-auto">
          "Don't let your favorite days vanish in the cloud."
        </p>

        {/* Scatter of Floating Physical Polaroids on Desk */}
        <div className="py-6 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          <div className="relative w-28 sm:w-36 bg-[#F6F3EB] rounded-[2px] p-2 pb-5 shadow-2xl -rotate-6 hover:rotate-0 transition-transform cursor-pointer">
            <div className="aspect-square bg-[#12110E] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80"
                alt="Anime sample"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-1.5 text-center font-['Caveat'] text-[11px] text-[#27241D]">
              anime series
            </div>
          </div>

          <div className="relative w-32 sm:w-40 bg-[#F6F3EB] rounded-[2px] p-2.5 pb-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform cursor-pointer -translate-y-2">
            <div className="aspect-square bg-[#12110E] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=300&q=80"
                alt="F1 sample"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-2 text-center font-['Caveat'] text-xs text-[#27241D] font-bold">
              eau rouge · f1
            </div>
          </div>

          <div className="relative w-28 sm:w-36 bg-[#F6F3EB] rounded-[2px] p-2 pb-5 shadow-2xl 8 hover:rotate-0 transition-transform cursor-pointer">
            <div className="aspect-square bg-[#12110E] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80"
                alt="Car sample"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-1.5 text-center font-['Caveat'] text-[11px] text-[#27241D]">
              air-cooled 911
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              playShutterSound();
              onShopClick();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg hover:shadow-[0_15px_30px_-5px_rgba(244,184,42,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            <span>SHOP POLAROIDS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              playPaperTapSound();
              onCreateCustomClick();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#14120E] hover:bg-[#1E1B15] text-[#E8DDC8] hover:text-[#F4B82A] font-semibold text-xs tracking-wider uppercase rounded-xl border border-[#27241D] hover:border-[#F4B82A]/40 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-[#F4B82A]" />
            <span>CREATE YOUR OWN</span>
          </button>
        </div>

        {/* Brand Signoff */}
        <div className="pt-8">
          <span className="font-['Syne'] text-2xl font-bold tracking-tight text-[#E8DDC8]/40">
            PIXÉ<span className="text-[#F4B82A]">.</span>CO
          </span>
        </div>

      </div>
    </section>
  );
};
