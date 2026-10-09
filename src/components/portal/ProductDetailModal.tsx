import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShoppingBag,
  Check,
  Sparkles,
  Plus,
  Minus,
  ShieldCheck,
  Heart,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { ArchiveProduct, PaperFinish, CartItem, POLAROID_STYLES, PolaroidStyle } from '../../types';
import { PolaroidImage } from '../PolaroidImage';
import { getPolaroidStyleConfig } from '../PolaroidCard';
import { useArchiveStorage, addRecentlyViewedId } from '../../utils/archiveStorage';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';

interface ProductDetailModalProps {
  product: ArchiveProduct | null;
  allProducts?: ArchiveProduct[];
  onSelectProduct?: (product: ArchiveProduct) => void;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCustomizer?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  onSelectProduct,
  onClose,
  onAddToCart,
  onOpenCustomizer,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [finish, setFinish] = useState<PaperFinish>('glossy');
  const [selectedStyle, setSelectedStyle] = useState<PolaroidStyle>(product?.style || 'Classic');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Controlled Zoom state (Section 20)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const photoContainerRef = useRef<HTMLDivElement>(null);

  // Archive storage (Favorites and Recently Viewed)
  const { isFavorite, toggleFavorite } = useArchiveStorage();
  const saved = product ? isFavorite(product.id) : false;

  // Sync selectedStyle when product changes & record recently viewed
  useEffect(() => {
    if (product) {
      setSelectedStyle(product.style || 'Classic');
      setZoomLevel(1);
      addRecentlyViewedId(product.id);
    }
  }, [product]);

  // Compute canonical related products (Sections 15 & 16)
  const relatedProducts = React.useMemo(() => {
    if (!product || !allProducts || allProducts.length === 0) return [];

    const normSubject = (product.characterOrSubject || product.subject || product.title).toLowerCase();

    // 1. Explicit canonical recommendations
    if (normSubject.includes('luffy')) {
      const targets = ['zoro', 'nami', 'sanji', 'shanks', 'ace', 'law'];
      const matches = targets
        .map((t) => allProducts.find((p) => p.id !== product.id && (p.characterOrSubject || p.title).toLowerCase().includes(t)))
        .filter(Boolean) as ArchiveProduct[];
      if (matches.length > 0) return matches.slice(0, 5);
    }

    if (normSubject.includes('messi')) {
      const targets = ['ronaldo', 'neymar', 'mbappe', 'haaland', 'salah'];
      const matches = targets
        .map((t) => allProducts.find((p) => p.id !== product.id && (p.characterOrSubject || p.title).toLowerCase().includes(t)))
        .filter(Boolean) as ArchiveProduct[];
      const more = allProducts.filter((p) => p.id !== product.id && p.category === 'football' && !matches.includes(p));
      return [...matches, ...more].slice(0, 5);
    }

    if (normSubject.includes('kohli')) {
      const targets = ['dhoni', 'rohit', 'sachin', 'bumrah', 'pandya'];
      const matches = targets
        .map((t) => allProducts.find((p) => p.id !== product.id && (p.characterOrSubject || p.title).toLowerCase().includes(t)))
        .filter(Boolean) as ArchiveProduct[];
      const more = allProducts.filter((p) => p.id !== product.id && p.category === 'cricket' && !matches.includes(p));
      return [...matches, ...more].slice(0, 5);
    }

    if (normSubject.includes('porsche') || normSubject.includes('911')) {
      const targets = ['ferrari', 'lamborghini', 'skyline', 'supra', 'mclaren'];
      const matches = targets
        .map((t) => allProducts.find((p) => p.id !== product.id && (p.characterOrSubject || p.title).toLowerCase().includes(t)))
        .filter(Boolean) as ArchiveProduct[];
      const more = allProducts.filter((p) => p.id !== product.id && p.category === 'cars' && !matches.includes(p));
      return [...matches, ...more].slice(0, 5);
    }

    if (normSubject.includes('batman')) {
      const targets = ['spiderman', 'iron man', 'superman', 'wonder woman'];
      const matches = targets
        .map((t) => allProducts.find((p) => p.id !== product.id && (p.characterOrSubject || p.title).toLowerCase().includes(t)))
        .filter(Boolean) as ArchiveProduct[];
      const more = allProducts.filter((p) => p.id !== product.id && p.category === 'heroes' && !matches.includes(p));
      return [...matches, ...more].slice(0, 5);
    }

    if (normSubject.includes('ichigo')) {
      const targets = ['rukia', 'orihime', 'renji', 'byakuya', 'aizen'];
      const matches = targets
        .map((t) => allProducts.find((p) => p.id !== product.id && (p.characterOrSubject || p.title).toLowerCase().includes(t)))
        .filter(Boolean) as ArchiveProduct[];
      if (matches.length > 0) return matches.slice(0, 5);
    }

    // 2. Direct keyRelationships target matches
    const relationTargets = product.keyRelationships?.map((r) => r.target.toLowerCase()) || [];
    const directRel = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        relationTargets.some((target) => (p.characterOrSubject || p.title).toLowerCase().includes(target))
    );

    // 3. Same franchise characters
    const franchiseRel = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        product.franchise &&
        p.franchise === product.franchise &&
        !directRel.some((m) => m.id === p.id)
    );

    // 4. Same category fallback
    const categoryRel = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        p.category === product.category &&
        !directRel.some((m) => m.id === p.id) &&
        !franchiseRel.some((m) => m.id === p.id)
    );

    return [...directRel, ...franchiseRel, ...categoryRel].slice(0, 5);
  }, [product, allProducts]);

  if (!product) return null;

  const styleConfig = getPolaroidStyleConfig(selectedStyle);
  const isCustom = product.category === 'custom';
  const totalPrice = product.price * quantity;

  // Zoom handlers
  const handleDoubleClickPhoto = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      setZoomLevel(1);
    } else {
      if (photoContainerRef.current) {
        const rect = photoContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomOrigin({ x, y });
      }
      setZoomLevel(1.8);
    }
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || zoomLevel > 1) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoomLevel((prev) => Math.min(2.5, Math.max(1, prev + delta)));
    }
  };

  const handleAddToCart = () => {
    playShutterSound();
    setAddedAnimation(true);

    const item: CartItem = {
      id: `${product.id}-${selectedStyle}-${finish}-${Date.now()}`,
      title: product.title,
      type: 'archive',
      price: product.price,
      quantity: quantity,
      caption: product.caption,
      imageUrl: product.image,
      paperFinish: finish,
      customDetails: {
        filterName: selectedStyle,
        caption: product.caption,
        textColor: styleConfig.titleColor,
        dateStamp: true,
        frameStyle: selectedStyle,
      },
    };

    onAddToCart(item);

    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 700);
  };

  const handleToggleFavorite = () => {
    playPaperTapSound();
    if (product) toggleFavorite(product.id);
  };

  const getFinishDescription = (f: PaperFinish) => {
    switch (f) {
      case 'glossy':
        return 'Classic High-Gloss: Radiant depth, deep blacks, high-contrast emulsion coating.';
      case 'matte':
        return 'Fine Art Matte: 310gsm non-reflective cotton rag, soft natural tones.';
      case 'vintage':
        return 'Analog Vintage: Subtle warm amber sepia curve with authentic film grain texture.';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.title} details`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#14120E] border border-[#27241D] rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Actions: Favorite & Close */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={saved ? 'Remove from saved' : 'Save to archive'}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider transition-all border ${
              saved
                ? 'bg-[#F4B82A] text-[#0B0A08] border-[#F4B82A]'
                : 'bg-[#1C1A15] text-[#E8DDC8]/80 hover:text-[#F4B82A] border-[#27241D]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
            <span>{saved ? 'SAVED' : 'SAVE'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product view"
            className="w-9 h-9 rounded-full bg-[#1C1A15] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] transition-colors flex items-center justify-center cursor-pointer border border-[#27241D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Large Physical Polaroid Presentation dynamically styled */}
          <div className="md:col-span-5 flex flex-col items-center sticky top-0">
            <div
              style={{
                transform: `rotate(${product.rotation || -1.2}deg)`,
              }}
              className={`relative w-64 sm:w-72 ${styleConfig.cardBg} rounded-[3px] p-3 pb-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none transition-all duration-300`}
            >
              {/* Gloss Sheen */}
              <div className="absolute inset-0 polaroid-sheen pointer-events-none rounded-[3px]" />

              {/* Tape detail matching style */}
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 h-5 rounded-[1px] shadow-xs rotate-1 z-20 flex items-center justify-center text-[8px] font-mono tracking-widest uppercase font-bold whitespace-nowrap ${styleConfig.tapeStyle}`}>
                {styleConfig.tapeLabel}
              </div>

              {/* Photograph Square with controlled zoom (Section 20) */}
              <div
                ref={photoContainerRef}
                onDoubleClick={handleDoubleClickPhoto}
                onWheel={handleWheelZoom}
                className="relative aspect-square w-full bg-[#12110E] overflow-hidden rounded-[1px] cursor-zoom-in"
                title="Double click or scroll to zoom photograph"
              >
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    transition: zoomLevel === 1 ? 'transform 0.25s ease-out' : 'none',
                  }}
                  className="w-full h-full"
                >
                  <PolaroidImage
                    src={product.image}
                    alt={product.title}
                    className={`w-full h-full object-cover filter ${styleConfig.imageFilter}`}
                  />
                </div>

                {/* Subtle Zoom Controls on photo */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-xs rounded px-1.5 py-1 z-20 border border-[#27241D]">
                  {zoomLevel > 1 ? (
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="text-[10px] font-mono text-[#F4B82A] flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>RESET</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1.8)}
                      className="text-[10px] font-mono text-[#E8DDC8]/70 hover:text-[#F4B82A] flex items-center gap-0.5"
                    >
                      <ZoomIn className="w-2.5 h-2.5" />
                      <span>ZOOM</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Handwritten / Styled Bottom Caption */}
              <div className="pt-2.5 px-1 flex items-baseline justify-between">
                <span className={`${styleConfig.captionClass} truncate pr-2 font-medium`}>
                  {product.caption}
                </span>
                <span className="font-mono text-[9px] text-[#7A7366] shrink-0 tabular-nums">
                  {product.dateStr || '2026'}
                </span>
              </div>
            </div>

            {/* Current Active Visual Style Indicator */}
            <div className="mt-3 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1A1813] border border-[#2B2720] text-[10px] font-mono text-[#F4B82A]">
              <Sparkles className="w-3 h-3" />
              <span>STYLE: <strong>{selectedStyle.toUpperCase()}</strong></span>
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="md:col-span-7 space-y-4 text-left">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#F4B82A] uppercase tracking-wider mb-1">
                <span>{product.category.toUpperCase()}</span>
                {product.franchise && (
                  <>
                    <span>/</span>
                    <span>{product.franchise}</span>
                  </>
                )}
                {product.subcategory && (
                  <>
                    <span>/</span>
                    <span className="text-[#E8DDC8]/60">{product.subcategory}</span>
                  </>
                )}
              </div>
              <h2 className="font-['Syne'] text-xl sm:text-2xl font-extrabold text-[#E8DDC8] leading-tight">
                {product.title}
              </h2>
              {product.epithet && (
                <p className="font-['Cormorant_Garamond'] italic text-base text-[#F4B82A]/90 mt-0.5">
                  &ldquo;{product.epithet}&rdquo;
                </p>
              )}
            </div>

            {/* Visual Style Selection (All 13 Canonical Styles) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#100F0C] border border-[#27241D]">
              <div className="flex items-center justify-between text-xs font-mono text-[#E8DDC8]/80 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#F4B82A]">
                  <SlidersHorizontal className="w-3 h-3" /> POLAROID VISUAL STYLE (13 STYLES)
                </span>
                <span className="text-[10px] text-[#E8DDC8]/50">Changes treatment only</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {POLAROID_STYLES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      playPaperTapSound();
                      setSelectedStyle(st);
                    }}
                    className={`px-2 py-1 text-[10px] font-mono rounded border transition-all cursor-pointer whitespace-nowrap ${
                      selectedStyle === st
                        ? 'border-[#F4B82A] bg-[#F4B82A] text-[#0B0A08] font-bold shadow-xs'
                        : 'border-[#27241D] bg-[#161410] text-[#E8DDC8]/70 hover:text-[#E8DDC8] hover:border-[#443D2F]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Metadata (Arcs, Affiliations, Relationships) */}
            {(product.arcs || product.affiliations || product.keyRelationships || product.role) && (
              <div className="p-3 rounded-xl bg-[#0F0E0B] border border-[#221F18] space-y-2 text-xs font-mono">
                {product.role && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#E8DDC8]/50 uppercase text-[10px]">Role / Status:</span>
                    <span className="text-[#E8DDC8] font-semibold">{product.role}</span>
                  </div>
                )}

                {product.arcs && product.arcs.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#1C1A14]">
                    <span className="text-[#E8DDC8]/50 uppercase text-[10px] mr-1">Story Arcs:</span>
                    {product.arcs.map((arc) => (
                      <span
                        key={arc}
                        className="px-2 py-0.5 rounded bg-[#1A1813] border border-[#2B2720] text-[10px] text-[#E8DDC8]"
                      >
                        {arc}
                      </span>
                    ))}
                  </div>
                )}

                {/* Canon Key Relationships */}
                {product.keyRelationships && product.keyRelationships.length > 0 && (
                  <div className="pt-1.5 border-t border-[#1C1A14] space-y-1">
                    <span className="text-[#E8DDC8]/50 uppercase text-[10px] block">Key Canon Relationships:</span>
                    <div className="space-y-1">
                      {product.keyRelationships.map((rel, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded bg-[#14120E] border border-[#221F18] flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[#E8DDC8] font-bold text-[11px]">{rel.target}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                rel.type === 'Love Interest'
                                  ? 'bg-[#FF5577]/15 text-[#FF7799] border border-[#FF5577]/30'
                                  : rel.type === 'Rival'
                                  ? 'bg-[#F4B82A]/15 text-[#F4B82A] border border-[#F4B82A]/30'
                                  : rel.type === 'Family'
                                  ? 'bg-[#4499FF]/15 text-[#66B3FF] border border-[#4499FF]/30'
                                  : 'bg-[#27241D] text-[#E8DDC8]/70'
                              }`}
                            >
                              {rel.type}
                            </span>
                          </div>
                          {rel.notes && (
                            <p className="text-[10px] text-[#E8DDC8]/60 font-sans leading-tight">
                              {rel.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paper Finish Selector (MATTE, GLOSSY, VINTAGE) */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#E8DDC8]/80">
                PAPER EMULSION FINISH
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['glossy', 'matte', 'vintage'] as PaperFinish[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      playPaperTapSound();
                      setFinish(f);
                    }}
                    className={`py-2 px-2 text-xs font-bold uppercase rounded-lg border text-center transition-all cursor-pointer ${
                      finish === f
                        ? 'border-[#F4B82A] bg-[#1F1C16] text-[#F4B82A] shadow-md'
                        : 'border-[#27241D] bg-[#0E0D0B] text-[#E8DDC8]/60 hover:text-[#E8DDC8]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#E8DDC8]/60 font-light leading-relaxed">
                {getFinishDescription(finish)}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-2 border-y border-[#27241D]">
              <span className="text-xs font-mono uppercase text-[#E8DDC8]/80">QUANTITY</span>
              <div className="flex items-center gap-3 bg-[#0E0D0B] px-3 py-1.5 rounded-lg border border-[#27241D]">
                <button
                  type="button"
                  onClick={() => {
                    playPaperTapSound();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#E8DDC8] hover:text-[#F4B82A] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-sm text-[#E8DDC8] w-6 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playPaperTapSound();
                    setQuantity((q) => Math.min(20, q + 1));
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#E8DDC8] hover:text-[#F4B82A] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total & Add to Cart button */}
            <div className="space-y-3 pt-1">
              <div className="flex items-baseline justify-between text-xs font-mono text-[#E8DDC8]/70">
                <span>TOTAL PRINTS: {quantity}</span>
                <span>
                  SUBTOTAL: <strong className="text-[#F4B82A] text-sm tabular-nums">₹{totalPrice}</strong>
                </span>
              </div>

              {isCustom ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCustomizer?.();
                  }}
                  className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>OPEN CUSTOMIZER STUDIO</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addedAnimation}
                  className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ADDED TO CART!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO CART · ₹{totalPrice}</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#E8DDC8]/40 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F4B82A]" />
                <span>310 GSM ARCHIVAL PAPER · INCLUDES PROTECTIVE SLEEVE</span>
              </div>
            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* RELATED CANONICAL ARCHIVE PRODUCTS (Section 15 & 16) */}
        {/* ============================================================ */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#27241D] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4B82A]" />
                <h4 className="font-['Syne'] text-xs font-bold uppercase tracking-wider text-[#E8DDC8]">
                  RELATED CANONICAL ARCHIVES & CONNECTIONS
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#E8DDC8]/50">
                Exact Canon Match
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    playPaperTapSound();
                    onSelectProduct?.(rel);
                  }}
                  className="group p-2.5 rounded-xl bg-[#0E0D0B] border border-[#27241D] hover:border-[#F4B82A] transition-all cursor-pointer flex flex-col space-y-2 hover:-translate-y-1"
                >
                  <div className="relative aspect-square w-full bg-[#181612] rounded overflow-hidden">
                    <PolaroidImage
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <div className="text-[11px] font-['Syne'] font-bold text-[#E8DDC8] truncate group-hover:text-[#F4B82A] transition-colors" title={rel.title}>
                      {rel.characterOrSubject || rel.title}
                    </div>
                    <div className="text-[9px] font-mono text-[#E8DDC8]/50 truncate">
                      {rel.franchise || rel.category.toUpperCase()} · ₹{rel.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
