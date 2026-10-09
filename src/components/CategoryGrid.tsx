import React, { useState } from 'react';
import { POLAROID_CATEGORIES } from '../data/categories';
import { PolaroidCategory } from '../types';
import { PolaroidModal } from './PolaroidModal';
import { PolaroidImage } from './PolaroidImage';
import { playPaperTapSound, playShutterSound } from '../utils/audio';
import { Sparkles, Eye, Plus } from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory: (category: PolaroidCategory) => void;
  onOpenCustomizer: () => void;
  onAddToCart: (category: PolaroidCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  onOpenCustomizer,
  onAddToCart,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'culture' | 'motors' | 'custom'>('all');
  const [selectedModalCategory, setSelectedModalCategory] = useState<PolaroidCategory | null>(null);

  const filteredCategories = POLAROID_CATEGORIES.filter((cat) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'culture') return ['anime', 'heroes', 'movies', 'cartoons', 'games'].includes(cat.id);
    if (activeFilter === 'motors') return ['f1', 'cars', 'bikes'].includes(cat.id);
    if (activeFilter === 'custom') return ['quotes', 'custom'].includes(cat.id);
    return true;
  });

  const handleCardClick = (cat: PolaroidCategory) => {
    playPaperTapSound();
    if (cat.id === 'custom') {
      onOpenCustomizer();
    } else {
      setSelectedModalCategory(cat);
      onSelectCategory(cat);
    }
  };

  const getTapeStyle = (tapeColor: string) => {
    switch (tapeColor) {
      case 'yellow':
        return 'bg-[#F4B82A]/70 border-x-2 border-dashed border-[#F4B82A] text-black/60';
      case 'kraft':
        return 'bg-[#C2A379]/80 border-x-2 border-dashed border-[#9E7D52] text-black/60';
      case 'dark':
        return 'bg-[#2B2721]/90 border-x-2 border-dashed border-[#4A443A] text-white/60';
      case 'washi':
      default:
        return 'bg-[#E8DDC8]/60 border-x-2 border-dashed border-[#D2C5AD] text-black/50';
    }
  };

  return (
    <section id="categories-section" className="relative py-28 bg-[#0E0D0B] border-t border-[#1C1A15]">
      {/* Studio Lighting Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(244,184,42,0.04),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#F4B82A] font-semibold mb-3">
              <span className="w-8 h-[1px] bg-[#F4B82A]" />
              <span>02. The Curated Archive</span>
            </div>
            <h2 className="font-['Syne'] text-3xl sm:text-5xl font-bold tracking-tight text-[#E8DDC8]">
              PICK YOUR WORLD
            </h2>
            <p className="font-['Cormorant_Garamond'] italic text-xl sm:text-2xl text-[#E8DDC8]/70 mt-1">
              Choose something that feels like you.
            </p>
          </div>

          {/* Interactive Filter Controls (Segmented buttons with click handlers) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#14120E] rounded-lg border border-[#27241D] self-start md:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                setActiveFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-[#F4B82A] text-[#0B0A08] shadow-sm'
                  : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
              }`}
            >
              All Prints ({POLAROID_CATEGORIES.length})
            </button>
            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                setActiveFilter('culture');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'culture'
                  ? 'bg-[#F4B82A] text-[#0B0A08] shadow-sm'
                  : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
              }`}
            >
              Pop Culture
            </button>
            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                setActiveFilter('motors');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'motors'
                  ? 'bg-[#F4B82A] text-[#0B0A08] shadow-sm'
                  : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
              }`}
            >
              Motors & Speed
            </button>
            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                setActiveFilter('custom');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'custom'
                  ? 'bg-[#F4B82A] text-[#0B0A08] shadow-sm'
                  : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
              }`}
            >
              Quotes & Custom
            </button>
          </div>
        </div>

        {/* Physical Polaroid Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 pt-4">
          {filteredCategories.map((cat, idx) => {
            const isCustom = cat.id === 'custom';
            return (
              <div
                key={cat.id}
                onClick={() => handleCardClick(cat)}
                style={{
                  transform: `rotate(${cat.rotation}deg)`,
                }}
                className="group relative cursor-pointer select-none transition-all duration-300 hover:z-30 hover:-translate-y-3 hover:scale-[1.03] hover:rotate-0"
              >
                {/* Authentic Polaroid Photographic Physical Card */}
                <div className="relative bg-[#F6F3EB] rounded-[3px] p-3.5 pb-8 shadow-[0_15px_35px_-8px_rgba(0,0,0,0.85)] group-hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.95),0_0_20px_rgba(244,184,42,0.15)] transition-all">
                  
                  {/* Subtle Surface Gloss Sheen Overlay */}
                  <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[3px] opacity-75 group-hover:opacity-100 transition-opacity" />

                  {/* Physical Washi Tape Detail pinned to top edge */}
                  <div
                    style={{ transform: `translateX(-50%) rotate(${cat.tapeRotation}deg)` }}
                    className={`absolute -top-3 left-1/2 w-20 h-5 backdrop-blur-xs shadow-xs z-20 ${getTapeStyle(
                      cat.tapeColor
                    )} flex items-center justify-center text-[9px] font-mono tracking-widest uppercase opacity-90`}
                  >
                    PIXÉ ARCHIVE
                  </div>

                  {/* Photograph Square Frame */}
                  <div className="relative aspect-square w-full bg-[#161410] overflow-hidden rounded-[1px] shadow-inner">
                    <PolaroidImage
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover filter contrast-105 brightness-95 group-hover:scale-108 transition-transform duration-500"
                    />

                    {/* Gradient Depth Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-30 transition-opacity pointer-events-none" />

                    {/* Badge if present */}
                    {cat.badge && (
                      <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-[#F4B82A] text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[#F4B82A]/30">
                        {cat.badge}
                      </span>
                    )}

                    {/* Hover Quick Action Cue */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#F4B82A] text-[#0B0A08] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        {isCustom ? <Sparkles className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {isCustom ? 'Launch Studio' : 'Inspect Print'}
                      </span>
                      <span className="text-[10px] text-[#E8DDC8]/80 font-mono">
                        {cat.sampleCount} frames ready
                      </span>
                    </div>
                  </div>

                  {/* Handwritten Caption Area at Bottom */}
                  <div className="pt-3 px-1 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-['Syne'] text-base font-bold text-[#1A1813] tracking-tight uppercase group-hover:text-black transition-colors">
                        {cat.name}
                      </h3>
                      <span className="font-mono text-[9px] text-[#7A7366] tabular-nums">
                        {cat.dateStr}
                      </span>
                    </div>

                    <p className="font-['Caveat'] text-lg sm:text-xl text-[#3A352B] font-medium leading-none truncate">
                      {cat.highlightCaption}
                    </p>
                  </div>

                  {/* Subtle corner pin/tape wear touch */}
                  <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D5CBBC] opacity-60" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Polaroid Teaser Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#14120E] via-[#1A1712] to-[#14120E] border border-[#27241D] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-[#F4B82A] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Looking for your personal photo?</span>
            </div>
            <h3 className="font-['Syne'] text-xl sm:text-2xl font-bold text-[#E8DDC8]">
              Upload Any Image & Print Custom Polaroids
            </h3>
            <p className="text-xs sm:text-sm text-[#E8DDC8]/60 font-light">
              Add handwritten captions, vintage analog tone curves, and orange date stamps in our interactive studio.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playShutterSound();
              onOpenCustomizer();
            }}
            className="px-6 py-3 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            OPEN CUSTOMIZER STUDIO →
          </button>
        </div>

      </div>

      {/* Lightbox / Polaroid Inspection Modal */}
      <PolaroidModal
        category={selectedModalCategory}
        onClose={() => setSelectedModalCategory(null)}
        onAddToCart={onAddToCart}
        onCustomize={onOpenCustomizer}
      />
    </section>
  );
};
