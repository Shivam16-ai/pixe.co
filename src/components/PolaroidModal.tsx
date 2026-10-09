import React from 'react';
import { X, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { PolaroidCategory } from '../types';
import { PolaroidImage } from './PolaroidImage';
import { playPaperTapSound, playShutterSound } from '../utils/audio';

interface PolaroidModalProps {
  category: PolaroidCategory | null;
  onClose: () => void;
  onAddToCart: (cat: PolaroidCategory) => void;
  onCustomize: () => void;
}

export const PolaroidModal: React.FC<PolaroidModalProps> = ({
  category,
  onClose,
  onAddToCart,
  onCustomize,
}) => {
  if (!category) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${category.name} Polaroid preview`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-[#14120E] border border-[#27241D] rounded-2xl p-6 sm:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1C1A15] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] transition-colors flex items-center justify-center cursor-pointer border border-[#27241D]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Authentic Physical Polaroid Preview */}
          <div className="flex justify-center">
            <div className="relative w-64 bg-[#F6F3EB] rounded-[3px] p-3 pb-8 shadow-[0_30px_60px_rgba(0,0,0,0.9)] -rotate-1 group">
              <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[3px]" />
              
              {/* Tape detail */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 washi-tape rotate-1 z-20" />

              <div className="relative aspect-square w-full bg-[#12110E] overflow-hidden rounded-[1px]">
                <PolaroidImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover filter contrast-105"
                />
              </div>

              <div className="pt-3 px-1 flex items-baseline justify-between">
                <span className="font-['Caveat'] text-xl text-[#1E1B15] font-bold">
                  {category.highlightCaption}
                </span>
                <span className="font-mono text-[10px] text-[#6B6559]">
                  {category.dateStr}
                </span>
              </div>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="space-y-5 text-left">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#F4B82A] uppercase tracking-wider mb-1">
                <span>ARCHIVAL CURATION</span>
                <span>·</span>
                <span>{category.sampleCount}+ FRAMES</span>
              </div>
              <h3 className="font-['Syne'] text-3xl font-bold text-[#E8DDC8]">
                {category.name}
              </h3>
              <p className="text-sm font-['Cormorant_Garamond'] italic text-[#F4B82A] text-lg mt-0.5">
                "{category.tagline}"
              </p>
            </div>

            <p className="text-sm text-[#E8DDC8]/70 leading-relaxed font-light">
              {category.description}
            </p>

            {/* Specifications */}
            <div className="space-y-1.5 text-xs text-[#E8DDC8]/60 border-y border-[#27241D] py-3">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#F4B82A]" />
                <span>3.5 × 4.2 in Classic Format (8.8 × 10.7 cm)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#F4B82A]" />
                <span>310 GSM Gloss Archival Photographic Paper</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#F4B82A]" />
                <span>Includes Protective Archival Glassine Sleeve</span>
              </div>
            </div>

            {/* Pricing & Order Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#E8DDC8]/60">Print Price</span>
                <span className="text-2xl font-['Syne'] font-bold text-[#E8DDC8] tabular-nums">
                  ₹40 <span className="text-xs font-normal text-[#E8DDC8]/50">/ print</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    playShutterSound();
                    onAddToCart(category);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPaperTapSound();
                    onCustomize();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1C1A15] hover:bg-[#27241D] text-[#E8DDC8] hover:text-[#F4B82A] font-semibold text-xs uppercase tracking-wider rounded-lg border border-[#27241D] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F4B82A]" />
                  <span>CUSTOMIZE</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
