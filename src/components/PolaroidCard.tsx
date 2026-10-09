import React from 'react';
import { Flame, Eye, Plus, ShoppingBag, Heart, ArrowUpRight } from 'lucide-react';
import { ArchiveProduct, PolaroidStyle } from '../types';
import { PolaroidImage } from './PolaroidImage';
import { useArchiveStorage } from '../utils/archiveStorage';
import { playPaperTapSound, playShutterSound } from '../utils/audio';

export interface PolaroidCardProps {
  product: ArchiveProduct;
  onInspect?: (product: ArchiveProduct) => void;
  onQuickAdd?: (product: ArchiveProduct, e: React.MouseEvent) => void;
  styleOverride?: PolaroidStyle;
  className?: string;
  rotation?: number;
}

interface StyleVisualConfig {
  cardBg: string;
  imageFilter: string;
  tapeLabel: string;
  tapeStyle: string;
  captionClass: string;
  titleColor: string;
  metaColor: string;
  dividerColor: string;
  priceColor: string;
  buttonBg: string;
  isDarkFrame: boolean;
}

export function getPolaroidStyleConfig(style?: PolaroidStyle): StyleVisualConfig {
  const norm = (style || 'Classic').toLowerCase();

  if (norm.includes('vintage')) {
    return {
      cardBg: 'bg-[#EFE5D1] border border-[#D5C29D]',
      imageFilter: 'sepia-[0.36] contrast-[1.08] brightness-[0.94] saturate-[0.82]',
      tapeLabel: '35MM KODACHROME',
      tapeStyle: 'bg-[#D9C496]/90 text-[#422E10]',
      captionClass: "font-['Caveat'] text-lg text-[#4A3B22]",
      titleColor: 'text-[#2D2111]',
      metaColor: 'text-[#7A5722]',
      dividerColor: 'border-[#D5C29D]/80',
      priceColor: 'text-[#2D2111]',
      buttonBg: 'bg-[#422E10] text-[#EFE5D1] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('black') || norm.includes('b&w') || norm === 'bw') {
    return {
      cardBg: 'bg-[#EDEDED] border border-[#CCCCCC]',
      imageFilter: 'grayscale contrast-[1.32] brightness-[0.95]',
      tapeLabel: 'MONOCHROME 35MM',
      tapeStyle: 'bg-[#2B2B2B] text-[#EDEDED]',
      captionClass: 'font-mono text-xs uppercase tracking-widest text-[#222222]',
      titleColor: 'text-[#111111]',
      metaColor: 'text-[#555555]',
      dividerColor: 'border-[#CCCCCC]',
      priceColor: 'text-[#111111]',
      buttonBg: 'bg-[#111111] text-[#EDEDED] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('editorial')) {
    return {
      cardBg: 'bg-[#FAF9F5] border border-[#E5E1D5]',
      imageFilter: 'contrast-[1.14] saturate-[1.12] brightness-[1.01]',
      tapeLabel: 'EDITORIAL EDITION',
      tapeStyle: 'bg-[#181818] text-[#FFFFFF]',
      captionClass: "font-['Syne'] text-xs font-bold uppercase tracking-wider text-[#111111]",
      titleColor: 'text-[#0E0E0E]',
      metaColor: 'text-[#666666]',
      dividerColor: 'border-[#E5E1D5]',
      priceColor: 'text-[#0E0E0E]',
      buttonBg: 'bg-[#181818] text-[#FAF9F5] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('cinematic')) {
    return {
      cardBg: 'bg-[#171512] border border-[#2B2720]',
      imageFilter: 'contrast-[1.18] brightness-[0.92] saturate-[1.08]',
      tapeLabel: '2.39:1 SCOPE MASTER',
      tapeStyle: 'bg-[#F4B82A] text-[#0B0A08] font-bold',
      captionClass: "font-['Syne'] text-xs font-semibold tracking-widest text-[#F4B82A]",
      titleColor: 'text-[#E8DDC8]',
      metaColor: 'text-[#C5A85A]',
      dividerColor: 'border-[#2B2720]',
      priceColor: 'text-[#F4B82A]',
      buttonBg: 'bg-[#F4B82A] text-[#0B0A08] hover:bg-[#E2A618]',
      isDarkFrame: true,
    };
  }

  if (norm.includes('pop')) {
    return {
      cardBg: 'bg-[#FFFDF4] border-2 border-[#F4B82A]',
      imageFilter: 'saturate-[1.5] contrast-[1.16] brightness-[1.03]',
      tapeLabel: 'POP ART ARCHIVE',
      tapeStyle: 'bg-[#F4B82A] text-black font-extrabold',
      captionClass: "font-['Caveat'] text-xl font-bold text-[#C2410C]",
      titleColor: 'text-[#18181B]',
      metaColor: 'text-[#B45309]',
      dividerColor: 'border-[#F4B82A]/40',
      priceColor: 'text-[#C2410C]',
      buttonBg: 'bg-[#18181B] text-[#FFFDF4] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('sports')) {
    return {
      cardBg: 'bg-[#F1F3F5] border border-[#CFD4DA]',
      imageFilter: 'contrast-[1.26] saturate-[1.2] brightness-[1.0]',
      tapeLabel: 'ACTION // 1/4000S',
      tapeStyle: 'bg-[#0F172A] text-[#38BDF8]',
      captionClass: 'font-mono text-xs font-bold uppercase tracking-wider text-[#0F172A]',
      titleColor: 'text-[#0F172A]',
      metaColor: 'text-[#0284C7]',
      dividerColor: 'border-[#CFD4DA]',
      priceColor: 'text-[#0F172A]',
      buttonBg: 'bg-[#0F172A] text-[#F1F3F5] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('minimal')) {
    return {
      cardBg: 'bg-[#FFFFFF] border border-[#EAEAEA]',
      imageFilter: 'saturate-[0.86] contrast-[1.02] brightness-[1.01]',
      tapeLabel: 'PIXÉ MINIMAL',
      tapeStyle: 'bg-[#F4F4F5] text-[#71717A]',
      captionClass: 'font-mono text-[10px] tracking-widest uppercase text-[#52525B]',
      titleColor: 'text-[#18181B]',
      metaColor: 'text-[#71717A]',
      dividerColor: 'border-[#EAEAEA]',
      priceColor: 'text-[#18181B]',
      buttonBg: 'bg-[#18181B] text-[#FFFFFF] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('retro')) {
    return {
      cardBg: 'bg-[#F5EDD8] border border-[#DECDB0]',
      imageFilter: 'sepia-[0.24] contrast-[1.12] brightness-[0.96] hue-rotate-[-10deg]',
      tapeLabel: 'RETRO ARCHIVE 1978',
      tapeStyle: 'bg-[#D4A373] text-[#3E2723]',
      captionClass: "font-['Caveat'] text-lg text-[#5C3D18]",
      titleColor: 'text-[#2D1B06]',
      metaColor: 'text-[#8A5A1A]',
      dividerColor: 'border-[#DECDB0]',
      priceColor: 'text-[#2D1B06]',
      buttonBg: 'bg-[#3E2723] text-[#F5EDD8] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('art')) {
    return {
      cardBg: 'bg-[#F8F5EE] border border-[#DDD7C9]',
      imageFilter: 'contrast-[1.04] brightness-[0.98] saturate-[0.93]',
      tapeLabel: '310GSM COTTON RAG',
      tapeStyle: 'bg-[#D6CEBE] text-[#3C362B]',
      captionClass: "font-['Cormorant_Garamond'] italic text-base text-[#2E2822]",
      titleColor: 'text-[#1E1B16]',
      metaColor: 'text-[#706453]',
      dividerColor: 'border-[#DDD7C9]',
      priceColor: 'text-[#1E1B16]',
      buttonBg: 'bg-[#2E2822] text-[#F8F5EE] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
      isDarkFrame: false,
    };
  }

  if (norm.includes('manga')) {
    return {
      cardBg: 'bg-[#FFFFFF] border-2 border-black',
      imageFilter: 'grayscale contrast-[1.58] brightness-[1.04]',
      tapeLabel: 'MANGA PANEL',
      tapeStyle: 'bg-black text-white font-extrabold',
      captionClass: "font-['Syne'] text-xs font-black uppercase tracking-tight text-black",
      titleColor: 'text-black font-extrabold',
      metaColor: 'text-[#444444]',
      dividerColor: 'border-black',
      priceColor: 'text-black',
      buttonBg: 'bg-black text-white hover:bg-[#F4B82A] hover:text-black',
      isDarkFrame: false,
    };
  }

  if (norm.includes('wanted')) {
    return {
      cardBg: 'bg-[#EFE3C3] border-2 border-[#B99F6C]',
      imageFilter: 'sepia-[0.32] contrast-[1.16] brightness-[0.92]',
      tapeLabel: 'DEAD OR ALIVE',
      tapeStyle: 'bg-[#B99F6C] text-[#2C1802] font-black',
      captionClass: 'font-mono text-xs font-black uppercase tracking-widest text-[#3E2207]',
      titleColor: 'text-[#3E2207]',
      metaColor: 'text-[#6B4210]',
      dividerColor: 'border-[#B99F6C]',
      priceColor: 'text-[#3E2207]',
      buttonBg: 'bg-[#3E2207] text-[#EFE3C3] hover:bg-[#F4B82A] hover:text-black',
      isDarkFrame: false,
    };
  }

  if (norm.includes('profile')) {
    return {
      cardBg: 'bg-[#191714] border border-[#3C3529]',
      imageFilter: 'contrast-[1.18] brightness-[0.96] saturate-[1.1]',
      tapeLabel: 'DOSSIER // ARCHIVE',
      tapeStyle: 'bg-[#F4B82A]/20 border border-[#F4B82A]/40 text-[#F4B82A]',
      captionClass: 'font-mono text-xs font-bold uppercase tracking-wider text-[#F4B82A]',
      titleColor: 'text-[#F5EEDB]',
      metaColor: 'text-[#D4AF37]',
      dividerColor: 'border-[#3C3529]',
      priceColor: 'text-[#F4B82A]',
      buttonBg: 'bg-[#F4B82A] text-[#0B0A08] hover:bg-[#E2A618]',
      isDarkFrame: true,
    };
  }

  // Default: Classic
  return {
    cardBg: 'bg-[#F6F3EB] border border-[#E3DAC8]',
    imageFilter: 'contrast-105 brightness-98',
    tapeLabel: 'PIXÉ ARCHIVE',
    tapeStyle: 'bg-[#E5D7B7]/90 text-black/70',
    captionClass: "font-['Caveat'] text-lg text-[#3A352B]",
    titleColor: 'text-[#1A1813]',
    metaColor: 'text-[#8C6D1F]',
    dividerColor: 'border-[#DED7C8]/80',
    priceColor: 'text-[#1F1C16]',
    buttonBg: 'bg-[#1F1C16] text-[#F6F3EB] hover:bg-[#F4B82A] hover:text-[#0B0A08]',
    isDarkFrame: false,
  };
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  product,
  onInspect,
  onQuickAdd,
  styleOverride,
  className = '',
  rotation,
}) => {
  const { isFavorite, toggleFavorite } = useArchiveStorage();
  const saved = isFavorite(product.id);

  const activeStyle = styleOverride || product.style || 'Classic';
  const styleConfig = getPolaroidStyleConfig(activeStyle);
  const cardRotation = rotation !== undefined ? rotation : product.rotation || -1.2;

  const handleClick = () => {
    playPaperTapSound();
    onInspect?.(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPaperTapSound();
    toggleFavorite(product.id);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playShutterSound();
    onQuickAdd?.(product, e);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        transform: `rotate(${cardRotation}deg)`,
      }}
      className={`group relative cursor-pointer select-none transition-all duration-250 ease-out hover:z-30 hover:-translate-y-1.5 hover:scale-[1.015] hover:rotate-0 flex flex-col ${className}`}
    >
      {/* Authentic Physical Polaroid Card Base Styled According to activeStyle */}
      <div className={`relative ${styleConfig.cardBg} rounded-[3px] p-3 pb-6 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.85)] group-hover:shadow-[0_24px_48px_-10px_rgba(0,0,0,0.95)] transition-shadow duration-250 flex flex-col justify-between flex-1`}>
        
        {/* Subtle Gloss Sheen Overlay */}
        <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[3px] opacity-75 group-hover:opacity-100 transition-opacity" />

        {/* Washi tape strip pinned to top with style label */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 h-5 rounded-[1px] shadow-xs rotate-1 z-20 flex items-center justify-center text-[8px] font-mono tracking-widest uppercase font-bold whitespace-nowrap ${styleConfig.tapeStyle}`}>
          {styleConfig.tapeLabel}
        </div>

        {/* Inner Photo Square - The data determines the image directly */}
        <div className="relative aspect-square w-full bg-[#161410] overflow-hidden rounded-[1px] shadow-inner">
          <PolaroidImage
            src={product.image}
            alt={`${product.characterOrSubject || product.title} — ${product.franchise || product.category} Polaroid`}
            className={`w-full h-full object-cover filter ${styleConfig.imageFilter} group-hover:scale-103 transition-transform duration-500`}
          />

          {/* Favorite / Bookmark Action (Section 14) */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={saved ? `Remove ${product.title} from saved archive` : `Save ${product.title} to archive`}
            className={`absolute top-2 right-2 z-25 p-1.5 rounded-full transition-all duration-200 ${
              saved
                ? 'bg-[#F4B82A] text-[#0B0A08] shadow-md scale-105'
                : 'bg-black/60 text-[#E8DDC8]/80 hover:text-[#F4B82A] hover:bg-black/80 backdrop-blur-xs opacity-80 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current stroke-[2.5]' : 'stroke-[2]'}`} />
          </button>

          {/* Trending Badge (Clean unboxed subtle indicator) */}
          {product.trending && (
            <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-[#F4B82A] text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-[2px] border border-[#F4B82A]/30 flex items-center gap-1 z-20">
              <Flame className="w-2.5 h-2.5" />
              <span>TRENDING</span>
            </span>
          )}

          {/* Hover Inspect Cue: VIEW ARCHIVE ITEM → (Section 19) */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3 text-center z-20">
            <span className="font-['Syne'] text-[11px] font-bold uppercase tracking-widest text-[#E8DDC8] flex items-center gap-1 mb-1">
              <span>VIEW ARCHIVE ITEM</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#F4B82A]" />
            </span>
            <span className="text-[9px] text-[#E8DDC8]/70 font-mono tracking-wider">
              ₹{product.price} · {activeStyle}
            </span>
          </div>
        </div>

        {/* Bottom Margins with Title & Caption */}
        <div className="pt-3 px-1 space-y-1">
          <div className="flex items-baseline justify-between">
            <h4 className={`font-['Syne'] text-sm font-bold truncate uppercase tracking-tight ${styleConfig.titleColor}`} title={product.title}>
              {product.characterOrSubject || product.subject || product.title}
            </h4>
            <span className="font-mono text-[9px] text-[#7A7366] shrink-0 tabular-nums">
              {product.dateStr || '2026'}
            </span>
          </div>

          {/* Metadata line (Rank, Squad, Affiliation, Schrift) */}
          {(product.crewOrAffiliation || product.rank || product.squad || product.schrift) && (
            <div className={`text-[9px] font-mono font-semibold truncate leading-tight ${styleConfig.metaColor}`}>
              {product.rank ? `${product.rank}${product.squad ? ` · ${product.squad}` : ''}` : product.crewOrAffiliation}
              {product.schrift ? ` · ${product.schrift}` : ''}
              {product.bounty && !product.bounty.includes('Unknown') ? ` · ${product.bounty}` : ''}
            </div>
          )}

          {/* Bottom Caption formatted according to style */}
          <p className={`${styleConfig.captionClass} leading-none truncate`}>
            {product.caption || `${(product.characterOrSubject || product.title).toLowerCase()} · archival`}
          </p>

          {/* Price & Quick Add Button Row */}
          <div className={`pt-2 flex items-center justify-between border-t ${styleConfig.dividerColor} mt-2`}>
            <div className="flex items-baseline gap-1">
              <span className={`font-['Syne'] text-base font-extrabold tabular-nums ${styleConfig.priceColor}`}>
                ₹{product.price}
              </span>
              <span className="text-[9px] font-mono text-[#7A7366]">/ print</span>
            </div>

            {onQuickAdd && (
              <button
                type="button"
                onClick={handleQuickAddClick}
                aria-label={`Add ${product.title} to print collection`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs active:scale-95 ${styleConfig.buttonBg}`}
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>ADD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
