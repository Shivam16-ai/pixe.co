import React from 'react';
import { PRINT_PLANS } from '../data/categories';
import { PrintPlan } from '../types';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { playPaperTapSound, playShutterSound } from '../utils/audio';

interface ProductSectionProps {
  onSelectPlan: (plan: PrintPlan) => void;
  onOpenCustomizer: () => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  onSelectPlan,
  onOpenCustomizer,
}) => {
  return (
    <section id="pricing-section" className="relative py-28 bg-[#0B0A08] border-t border-[#1C1A15]">
      {/* Studio Lamp Ambient Cone */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#F4B82A]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold">
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
            <span>03. Studio Print Editions</span>
            <span className="w-6 h-[1px] bg-[#F4B82A]" />
          </div>
          <h2 className="font-['Syne'] text-4xl sm:text-5xl font-bold tracking-tight text-[#E8DDC8]">
            MAKE IT YOURS.
          </h2>
          <p className="font-['Cormorant_Garamond'] italic text-xl sm:text-2xl text-[#E8DDC8]/70">
            Archival prints. Zero digital compression. Ready to display.
          </p>
        </div>

        {/* 3 Physical Polaroid Presentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          {PRINT_PLANS.map((plan) => {
            const isTrio = plan.id === 'trio';
            const isCustom = plan.id === 'custom';

            return (
              <div
                key={plan.id}
                style={{
                  transform: `rotate(${plan.rotation}deg)`,
                }}
                className={`relative group rounded-xl transition-all duration-300 hover:rotate-0 hover:-translate-y-2 flex flex-col justify-between select-none ${
                  isTrio
                    ? 'bg-[#181611] border-2 border-[#F4B82A]/80 shadow-[0_25px_60px_-15px_rgba(244,184,42,0.25)]'
                    : 'bg-[#14120E] border border-[#27241D] shadow-[0_20px_45px_-12px_rgba(0,0,0,0.85)]'
                }`}
              >
                {/* Washi Tape on top */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape ${
                    isTrio ? 'bg-[#F4B82A]/70 text-[#0B0A08]' : 'bg-[#E8DDC8]/60 text-black/60'
                  } z-20 flex items-center justify-center text-[9px] font-mono tracking-widest uppercase font-bold`}
                >
                  {isTrio ? 'STUDIO FAVORITE' : 'PIXÉ BATCH'}
                </div>

                <div className="p-6 sm:p-7 space-y-6 flex-1 flex flex-col">
                  
                  {/* Polaroid Physical Thumbnail Frame */}
                  <div className="relative mx-auto w-48 bg-[#F6F3EB] rounded-[2px] p-2.5 pb-6 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[2px]" />
                    <div className="relative aspect-square w-full bg-[#12110E] overflow-hidden rounded-[1px]">
                      <img
                        src={plan.imageSample}
                        alt={plan.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter contrast-105"
                      />
                    </div>
                    <div className="pt-2 px-1 text-center font-['Caveat'] text-sm text-[#27241D] truncate">
                      {plan.caption}
                    </div>
                  </div>

                  {/* Plan Details & Pricing */}
                  <div className="text-center space-y-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#F4B82A]">
                      {plan.badge || 'Standard Edition'}
                    </div>
                    <h3 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-['Syne'] text-4xl sm:text-5xl font-extrabold text-[#E8DDC8] tabular-nums">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs text-[#E8DDC8]/50 font-mono">
                        / {plan.quantity > 1 ? `${plan.quantity} pack` : 'print'}
                      </span>
                    </div>
                    <p className="text-xs text-[#E8DDC8]/70 leading-relaxed font-light pt-1">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs text-[#E8DDC8]/80 border-t border-[#27241D] pt-4 mt-auto">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-[#F4B82A] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card CTA Button */}
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCustom) {
                        playShutterSound();
                        onOpenCustomizer();
                      } else {
                        playShutterSound();
                        onSelectPlan(plan);
                      }
                    }}
                    className={`w-full group/btn inline-flex items-center justify-center gap-2 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                      isTrio
                        ? 'bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08]'
                        : 'bg-[#1E1B15] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] border border-[#27241D]'
                    }`}
                  >
                    {isCustom ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>CUSTOMIZE YOURS →</span>
                      </>
                    ) : (
                      <>
                        <span>CHOOSE YOURS →</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Studio Guarantee Line */}
        <div className="mt-12 text-center text-xs text-[#E8DDC8]/50 font-mono">
          <span>FREE ARCHIVAL GLASSINE SLEEVE WITH EVERY ORDER</span>
          <span className="mx-3">·</span>
          <span>SHIPS IN RIGID STAY-FLAT BOARD</span>
          <span className="mx-3">·</span>
          <span>ESTIMATED DELIVERY 3-5 BUSINESS DAYS</span>
        </div>

      </div>
    </section>
  );
};
