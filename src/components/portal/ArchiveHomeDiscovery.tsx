import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame, Clock, Heart } from 'lucide-react';
import { ArchiveProduct } from '../../types';
import { PolaroidCard } from '../PolaroidCard';
import { playPaperTapSound } from '../../utils/audio';

interface ArchiveHomeDiscoveryProps {
  products: ArchiveProduct[];
  recentlyViewedIds: string[];
  favoriteIds: string[];
  onSelectProduct: (product: ArchiveProduct) => void;
  onQuickAdd: (product: ArchiveProduct, e: React.MouseEvent) => void;
  onExploreCategory: (category: string) => void;
  onExploreAll: () => void;
}

interface DiscoveryRowConfig {
  id: string;
  title: string;
  subtitle: string;
  categoryFilter?: string;
  filterFn?: (p: ArchiveProduct) => boolean;
}

export const ArchiveHomeDiscovery: React.FC<ArchiveHomeDiscoveryProps> = ({
  products,
  recentlyViewedIds,
  favoriteIds,
  onSelectProduct,
  onQuickAdd,
  onExploreCategory,
  onExploreAll,
}) => {
  // Map recently viewed IDs to product objects
  const recentlyViewedProducts = React.useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as ArchiveProduct[];
  }, [recentlyViewedIds, products]);

  // Curated section rows matching Section 2 requirements
  const sections: DiscoveryRowConfig[] = [
    {
      id: 'featured',
      title: 'FEATURED ARCHIVE',
      subtitle: 'Curated 35mm optical proofs and museum-grade master impressions',
      filterFn: (p) => Boolean(p.featured),
    },
    {
      id: 'trending',
      title: 'TRENDING NOW',
      subtitle: 'Most requested collectible prints across global darkrooms this week',
      filterFn: (p) => Boolean(p.trending || p.popularity >= 99),
    },
    {
      id: 'newly-added',
      title: 'NEWLY ADDED',
      subtitle: 'Freshly exposed emulsion batches from recent studio releases',
      filterFn: (p) => Boolean(p.newArrival || p.dateStr?.includes('10.05.26')),
    },
    {
      id: 'most-collected',
      title: 'MOST COLLECTED',
      subtitle: 'All-time darkroom favorites framed on collector desks worldwide',
      filterFn: (p) => (p.popularity || 0) >= 98,
    },
    {
      id: 'editors-picks',
      title: "EDITOR'S PICKS",
      subtitle: 'Rare frame geometries, striking monochrome contrast, and historical moments',
      filterFn: (p) => p.style === 'Cinematic' || p.style === 'Editorial' || p.style === 'Vintage Film',
    },
    {
      id: 'anime',
      title: 'ANIME UNIVERSE',
      subtitle: 'From the Grand Line to the Soul Society, Konoha, and Shibuya',
      categoryFilter: 'anime',
    },
    {
      id: 'sports',
      title: 'SPORTS ARCHIVE',
      subtitle: 'Immortalized centuries, World Cup finishes, and legendary athletic grit',
      filterFn: (p) => p.category === 'cricket' || p.category === 'football' || p.category === 'sports',
    },
    {
      id: 'cinema',
      title: 'CINEMA ARCHIVE',
      subtitle: 'Hollywood celluloid icons, Tarantino neo-noir, and Indian cinema spectacles',
      filterFn: (p) => p.category === 'hollywood' || p.category === 'bollywood' || p.category === 'tollywood' || p.category === 'movies',
    },
    {
      id: 'automotive',
      title: 'AUTOMOTIVE & SUPERCARS',
      subtitle: 'Air-cooled whale tails, twin-turbo V8s, scissor doors, and 300km/h superbikes',
      filterFn: (p) => p.category === 'cars' || p.category === 'bikes' || p.category === 'f1',
    },
    {
      id: 'travel-nature',
      title: 'TRAVEL & NATURE',
      subtitle: 'Neon Shinjuku rain, arctic auroras, and untamed apex predators',
      filterFn: (p) => p.category === 'travel' || p.category === 'nature' || p.category === 'animals',
    },
    {
      id: 'cartoons-games',
      title: 'CARTOON & GAMING',
      subtitle: 'Voxel horizons, Los Santos sunsets, and hand-drawn animation nostalgia',
      filterFn: (p) => p.category === 'cartoons' || p.category === 'games',
    },
    {
      id: 'music-culture',
      title: 'MUSIC & CULTURE',
      subtitle: 'Wembley stadium roar, rock deities, and silver-screen legends',
      filterFn: (p) => p.category === 'music' || p.category === 'celebrities',
    },
    {
      id: 'quotes',
      title: 'QUOTES & TYPOGRAPHY',
      subtitle: 'Monastic discipline, darkroom philosophy, and words to live by',
      categoryFilter: 'quotes',
    },
  ];

  return (
    <div className="space-y-12 select-none pb-12">
      
      {/* ============================================================ */}
      {/* ARCHIVE LANDING HERO (Section 2) */}
      {/* ============================================================ */}
      <div className="text-center max-w-2xl mx-auto pt-4 pb-2 px-4 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#F4B82A] px-2.5 py-0.5 rounded-[2px] bg-[#1F1C16] border border-[#F4B82A]/30">
          <Sparkles className="w-3 h-3" />
          <span>EDITORIAL ARCHIVE CATALOG</span>
        </div>
        
        <h1 className="font-['Syne'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#E8DDC8] tracking-tight">
          PIXÉ ARCHIVE
        </h1>
        
        <p className="font-['Cormorant_Garamond'] italic text-lg sm:text-xl text-[#E8DDC8]/80 leading-relaxed">
          &ldquo;A collection of moments, characters, icons, places and stories worth holding onto.&rdquo;
        </p>

        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-[#E8DDC8]/50">
          <span>360+ PHYSICAL PROOFS</span>
          <span>·</span>
          <span>13 POLAROID STYLES</span>
          <span>·</span>
          <span>310 GSM COTTON RAG</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RECENTLY VIEWED ROW (Section 13) */}
      {/* ============================================================ */}
      {recentlyViewedProducts.length > 0 && (
        <DiscoveryRow
          title="RECENTLY VIEWED"
          subtitle="Your personal discovery trail through the darkroom"
          items={recentlyViewedProducts}
          onSelectProduct={onSelectProduct}
          onQuickAdd={onQuickAdd}
          badgeIcon={<Clock className="w-3 h-3 text-[#F4B82A]" />}
        />
      )}

      {/* ============================================================ */}
      {/* EDITORIAL DISCOVERY SECTIONS */}
      {/* ============================================================ */}
      {sections.map((sec) => {
        let items: ArchiveProduct[] = [];
        if (sec.categoryFilter) {
          items = products.filter((p) => p.category === sec.categoryFilter);
        } else if (sec.filterFn) {
          items = products.filter(sec.filterFn);
        }

        if (items.length === 0) return null;

        return (
          <DiscoveryRow
            key={sec.id}
            title={sec.title}
            subtitle={sec.subtitle}
            items={items.slice(0, 16)}
            onSelectProduct={onSelectProduct}
            onQuickAdd={onQuickAdd}
            onViewMore={() => {
              if (sec.categoryFilter) {
                onExploreCategory(sec.categoryFilter);
              } else {
                onExploreAll();
              }
            }}
          />
        );
      })}

    </div>
  );
};

interface DiscoveryRowProps {
  title: string;
  subtitle: string;
  items: ArchiveProduct[];
  onSelectProduct: (product: ArchiveProduct) => void;
  onQuickAdd: (product: ArchiveProduct, e: React.MouseEvent) => void;
  onViewMore?: () => void;
  badgeIcon?: React.ReactNode;
}

const DiscoveryRow: React.FC<DiscoveryRowProps> = ({
  title,
  subtitle,
  items,
  onSelectProduct,
  onQuickAdd,
  onViewMore,
  badgeIcon,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    playPaperTapSound();
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header and Controls */}
      <div className="flex items-end justify-between border-b border-[#221F18] pb-3">
        <div className="text-left space-y-0.5">
          <div className="flex items-center gap-2">
            {badgeIcon}
            <h3 className="font-['Syne'] text-base sm:text-lg font-bold text-[#E8DDC8] tracking-tight uppercase">
              {title}
            </h3>
            <span className="font-mono text-[10px] text-[#E8DDC8]/40">
              ({items.length} PRINTS)
            </span>
          </div>
          <p className="text-xs text-[#E8DDC8]/60 font-light hidden sm:block">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onViewMore && (
            <button
              type="button"
              onClick={onViewMore}
              className="text-xs font-mono font-semibold text-[#F4B82A] hover:text-[#E8DDC8] transition-colors flex items-center gap-1 cursor-pointer pr-2"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Left/Right scroll buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label={`Scroll ${title} left`}
              className="w-8 h-8 rounded-full bg-[#161410] border border-[#27241D] hover:border-[#F4B82A] text-[#E8DDC8] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label={`Scroll ${title} right`}
              className="w-8 h-8 rounded-full bg-[#161410] border border-[#27241D] hover:border-[#F4B82A] text-[#E8DDC8] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-5 overflow-x-auto pb-5 pt-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((product) => (
          <div
            key={product.id}
            className="w-56 sm:w-64 shrink-0 snap-start flex flex-col"
          >
            <PolaroidCard
              product={product}
              onInspect={onSelectProduct}
              onQuickAdd={onQuickAdd}
            />
          </div>
        ))}
      </div>

    </section>
  );
};
