import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Check,
  Eye,
  Flame,
  Clock,
  Layers,
  Tag,
  ChevronDown,
  X,
  RotateCcw,
  Grid3X3,
  Compass,
  Filter,
} from 'lucide-react';
import { ArchiveProduct, ArchiveCategory, CartItem, PaperFinish, POLAROID_STYLES } from '../../types';
import { ARCHIVE_CATEGORIES, ARCHIVE_PRODUCTS } from '../../data/archiveCatalog';
import { ProductDetailModal } from './ProductDetailModal';
import { PolaroidCard } from '../PolaroidCard';
import { ArchiveSearch } from './ArchiveSearch';
import { ArchiveHomeDiscovery } from './ArchiveHomeDiscovery';
import { CategoryNavigation } from './CategoryNavigation';
import { PolaroidSkeleton } from './PolaroidSkeleton';
import { rankArchiveProducts } from '../../utils/archiveSearchEngine';
import { useArchiveStorage } from '../../utils/archiveStorage';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';

interface ShopArchiveProps {
  cartItems: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onOpenCustomizer: () => void;
  onOpenCart: () => void;
}

type SortOption = 'relevance' | 'trending' | 'popular' | 'new' | 'az' | 'price-asc' | 'price-desc';

// Helper to parse URL query params
function getUrlParams() {
  if (typeof window === 'undefined') {
    return {
      search: '',
      category: 'all',
      franchise: 'all',
      subcategory: 'all',
      style: 'all',
      role: 'all',
      arc: 'all',
      sort: 'trending' as SortOption,
      view: 'discovery' as 'discovery' | 'grid',
    };
  }
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || params.get('q') || '';
  const category = params.get('category') || 'all';
  const franchise = params.get('franchise') || 'all';
  const subcategory = params.get('subcategory') || 'all';
  const style = params.get('style') || 'all';
  const role = params.get('role') || params.get('player') || params.get('brand') || 'all';
  const arc = params.get('arc') || 'all';
  const sort = (params.get('sort') as SortOption) || (search ? 'relevance' : 'trending');
  const view = (params.get('view') as 'discovery' | 'grid') || (search || category !== 'all' ? 'grid' : 'discovery');

  return { search, category, franchise, subcategory, style, role, arc, sort, view };
}

export const ShopArchive: React.FC<ShopArchiveProps> = ({
  cartItems,
  onAddToCart,
  onOpenCustomizer,
  onOpenCart,
}) => {
  const initialParams = useMemo(getUrlParams, []);

  // Filter & Search State (Synchronized with URL)
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.search);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.category);
  const [selectedFranchise, setSelectedFranchise] = useState<string>(initialParams.franchise);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialParams.subcategory);
  const [selectedRole, setSelectedRole] = useState<string>(initialParams.role);
  const [selectedArc, setSelectedArc] = useState<string>(initialParams.arc);
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>(initialParams.style);
  const [sortBy, setSortBy] = useState<SortOption>(initialParams.sort);
  const [activeView, setActiveView] = useState<'discovery' | 'grid'>(initialParams.view);

  // Mobile Filter Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Detail Modal State
  const [inspectProduct, setInspectProduct] = useState<ArchiveProduct | null>(null);

  // Batch Pagination: 24 cards per batch (Section 21)
  const BATCH_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Favorites & Storage
  const { favoriteIds, recentlyViewedIds } = useArchiveStorage();

  // Sync URL search params whenever state changes (Section 9)
  const updateUrlQuery = useCallback(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedFranchise !== 'all') params.set('franchise', selectedFranchise);
    if (selectedSubcategory !== 'all') params.set('subcategory', selectedSubcategory);
    if (selectedStyle !== 'all') params.set('style', selectedStyle);
    if (selectedRole !== 'all') params.set('role', selectedRole);
    if (selectedArc !== 'all') params.set('arc', selectedArc);
    if (sortBy !== (searchQuery ? 'relevance' : 'trending')) params.set('sort', sortBy);
    if (activeView !== (searchQuery || selectedCategory !== 'all' ? 'grid' : 'discovery')) {
      params.set('view', activeView);
    }

    const currentBase = window.location.pathname;
    const newSearch = params.toString();
    const newUrl = newSearch ? `${currentBase}?${newSearch}` : currentBase;

    if (window.location.search !== (newSearch ? `?${newSearch}` : '')) {
      window.history.pushState(null, '', newUrl);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedFranchise,
    selectedSubcategory,
    selectedStyle,
    selectedRole,
    selectedArc,
    sortBy,
    activeView,
  ]);

  useEffect(() => {
    updateUrlQuery();
  }, [updateUrlQuery]);

  // Handle browser back/forward buttons (Section 9)
  useEffect(() => {
    const handlePopState = () => {
      const p = getUrlParams();
      setSearchQuery(p.search);
      setSelectedCategory(p.category);
      setSelectedFranchise(p.franchise);
      setSelectedSubcategory(p.subcategory);
      setSelectedStyle(p.style);
      setSelectedRole(p.role);
      setSelectedArc(p.arc);
      setSortBy(p.sort);
      setActiveView(p.view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When search query is entered, automatically switch to grid view and relevance sort
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setVisibleCount(BATCH_SIZE);
    if (q.trim()) {
      setActiveView('grid');
      setSortBy('relevance');
    }
  };

  // Currently active category metadata object
  const activeCategoryObj = useMemo(() => {
    return ARCHIVE_CATEGORIES.find((c) => c.id === selectedCategory);
  }, [selectedCategory]);

  // Dynamic filter options based on category (Section 8)
  const dynamicFilterOptions = useMemo(() => {
    const catProducts = selectedCategory === 'all'
      ? ARCHIVE_PRODUCTS
      : ARCHIVE_PRODUCTS.filter((p) => p.category === selectedCategory);

    // Franchises
    const franchises = Array.from(new Set(catProducts.map((p) => p.franchise).filter(Boolean))) as string[];

    // Story Arcs
    const arcs = Array.from(
      new Set(
        catProducts
          .flatMap((p) => p.arcs || [])
          .filter(Boolean)
      )
    );

    // Roles / Factions
    const roles = Array.from(
      new Set(
        catProducts
          .flatMap((p) => [p.role, ...(p.relationshipGroup || [])])
          .filter(Boolean)
      )
    ) as string[];

    // Subcategories
    const subcategories = Array.from(new Set(catProducts.map((p) => p.subcategory).filter(Boolean))) as string[];

    // Divisions / Squads (Bleach Gotei 13 & Espada)
    const divisions = Array.from(new Set(catProducts.map((p) => p.squad).filter(Boolean))) as string[];

    return { franchises, arcs, roles, subcategories, divisions };
  }, [selectedCategory]);

  // Ranked & Filtered Products (Section 3 & 4)
  const filteredProducts = useMemo(() => {
    let result = [...ARCHIVE_PRODUCTS];

    // 1. Relevance Search Ranking
    if (searchQuery.trim()) {
      result = rankArchiveProducts(result, searchQuery);
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 3. Franchise Filter
    if (selectedFranchise !== 'all') {
      result = result.filter((p) => p.franchise === selectedFranchise);
    }

    // 4. Subcategory Filter
    if (selectedSubcategory !== 'all') {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    // 5. Arc Filter
    if (selectedArc !== 'all') {
      result = result.filter((p) => p.arcs && p.arcs.includes(selectedArc));
    }

    // 6. Division / Squad Filter (Bleach)
    if (selectedDivision !== 'all') {
      result = result.filter((p) => p.squad === selectedDivision);
    }

    // 7. Role / Faction Filter
    if (selectedRole !== 'all') {
      result = result.filter(
        (p) =>
          p.role === selectedRole ||
          (p.relationshipGroup && p.relationshipGroup.includes(selectedRole)) ||
          p.characterOrSubject?.toLowerCase().includes(selectedRole.toLowerCase())
      );
    }

    // 8. Visual Style Filter
    if (selectedStyle !== 'all') {
      result = result.filter((p) => (p.style || 'Classic') === selectedStyle);
    }

    // 8. Sorting (Section 35)
    if (sortBy === 'trending') {
      result.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'new') {
      result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
    } else if (sortBy === 'az') {
      result.sort((a, b) => (a.characterOrSubject || a.title).localeCompare(b.characterOrSubject || b.title));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    searchQuery,
    selectedCategory,
    selectedFranchise,
    selectedSubcategory,
    selectedArc,
    selectedRole,
    selectedStyle,
    sortBy,
  ]);

  // Paginated slice for current batch
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    playPaperTapSound();
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

  // Clear all filters (Section 10)
  const handleClearAllFilters = () => {
    playPaperTapSound();
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFranchise('all');
    setSelectedSubcategory('all');
    setSelectedRole('all');
    setSelectedArc('all');
    setSelectedDivision('all');
    setSelectedStyle('all');
    setSortBy('trending');
    setVisibleCount(BATCH_SIZE);
  };

  const handleQuickAdd = (product: ArchiveProduct, e: React.MouseEvent) => {
    playShutterSound();
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      title: product.title,
      type: 'archive',
      price: product.price,
      quantity: 1,
      caption: product.caption,
      imageUrl: product.image,
      customDetails: {
        filterName: product.style || 'Classic',
        caption: product.caption,
        frameStyle: product.style || 'Classic',
        textColor: '#E8DDC8',
        dateStamp: true,
      },
    };
    onAddToCart(item);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedFranchise !== 'all' ||
    selectedSubcategory !== 'all' ||
    selectedRole !== 'all' ||
    selectedArc !== 'all' ||
    selectedDivision !== 'all' ||
    selectedStyle !== 'all';

  return (
    <div className="w-full min-h-screen bg-[#0B0A08] text-[#E8DDC8] flex flex-col select-none">
      
      {/* ============================================================ */}
      {/* ADVANCED ARCHIVE SEARCH HEADER (Section 3, 5, 6) */}
      {/* ============================================================ */}
      <div className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <ArchiveSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSelectProduct={(p) => setInspectProduct(p)}
          allProducts={ARCHIVE_PRODUCTS}
          totalMatches={filteredProducts.length}
        />
      </div>

      {/* ============================================================ */}
      {/* CATEGORY & FRANCHISE NAVIGATION (Section 11 & 12) */}
      {/* ============================================================ */}
      <CategoryNavigation
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        selectedFranchise={selectedFranchise}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedSubcategory('all');
          setSelectedFranchise('all');
          setSelectedArc('all');
          setSelectedRole('all');
          setVisibleCount(BATCH_SIZE);
          if (catId !== 'all') setActiveView('grid');
        }}
        onSelectSubcategory={(sub) => {
          setSelectedSubcategory(sub);
          setVisibleCount(BATCH_SIZE);
          setActiveView('grid');
        }}
        onSelectFranchise={(fr) => {
          setSelectedFranchise(fr);
          setVisibleCount(BATCH_SIZE);
          setActiveView('grid');
        }}
      />

      {/* ============================================================ */}
      {/* VIEW SWITCHER & SUB-HEADER BAR */}
      {/* ============================================================ */}
      <div className="border-b border-[#221F18] py-2.5 px-4 sm:px-6 lg:px-8 bg-[#0D0B09]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-mono">
          
          {/* Breadcrumbs (Section 34) */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[#E8DDC8]/60 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={() => {
                handleClearAllFilters();
                setActiveView('discovery');
              }}
              className="hover:text-[#F4B82A] transition-colors"
            >
              PIXÉ.CO
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedFranchise('all');
              }}
              className="hover:text-[#F4B82A] transition-colors"
            >
              ARCHIVE
            </button>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-[#F4B82A] font-bold uppercase">{selectedCategory}</span>
              </>
            )}
            {selectedFranchise !== 'all' && (
              <>
                <span>/</span>
                <span className="text-[#E8DDC8] font-bold">{selectedFranchise}</span>
              </>
            )}
          </nav>

          {/* View Mode Toggle: Editorial Discovery vs Complete Grid */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                setActiveView('discovery');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'discovery'
                  ? 'bg-[#1C1A14] text-[#F4B82A] font-bold border border-[#F4B82A]/30'
                  : 'text-[#E8DDC8]/50 hover:text-[#E8DDC8]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DISCOVERY</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                setActiveView('grid');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'grid'
                  ? 'bg-[#1C1A14] text-[#F4B82A] font-bold border border-[#F4B82A]/30'
                  : 'text-[#E8DDC8]/50 hover:text-[#E8DDC8]'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>ALL PRINTS ({filteredProducts.length})</span>
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: EDITORIAL DISCOVERY LANDING (Section 2) */}
        {activeView === 'discovery' && !searchQuery.trim() && selectedCategory === 'all' ? (
          <ArchiveHomeDiscovery
            products={ARCHIVE_PRODUCTS}
            recentlyViewedIds={recentlyViewedIds}
            favoriteIds={favoriteIds}
            onSelectProduct={(p) => setInspectProduct(p)}
            onQuickAdd={handleQuickAdd}
            onExploreCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveView('grid');
            }}
            onExploreAll={() => setActiveView('grid')}
          />
        ) : (
          /* VIEW 2: SEARCH RESULTS & GRID EXPLORATION (Section 7, 8, 21) */
          <div className="space-y-6">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#221F18] pb-4">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-['Syne'] text-xl sm:text-2xl font-extrabold text-[#E8DDC8]">
                    {searchQuery ? `SEARCH RESULTS FOR "${searchQuery}"` : activeCategoryObj?.name || 'COMPLETE ARCHIVE'}
                  </h2>
                </div>
                <p className="text-xs font-mono text-[#E8DDC8]/60">
                  {filteredProducts.length} VERIFIED ARCHIVE PROOFS READY FOR PRINTING
                </p>
              </div>

              {/* Sorting & Filter Trigger */}
              <div className="flex items-center gap-3">
                
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="sm:hidden px-3 py-1.5 rounded bg-[#161410] border border-[#27241D] text-xs font-mono flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5 text-[#F4B82A]" />
                  <span>FILTERS</span>
                </button>

                {/* Sort Selector (Section 35) */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#E8DDC8]/50 hidden sm:inline">SORT BY:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      playPaperTapSound();
                      setSortBy(e.target.value as SortOption);
                    }}
                    className="bg-[#14120E] border border-[#27241D] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#E8DDC8] focus:border-[#F4B82A] focus:outline-none cursor-pointer"
                  >
                    {searchQuery && <option value="relevance">RELEVANCE RANKING</option>}
                    <option value="trending">TRENDING NOW</option>
                    <option value="popular">MOST COLLECTED</option>
                    <option value="new">NEWEST ARRIVALS</option>
                    <option value="az">A — Z TITLE</option>
                    <option value="price-asc">PRICE: LOW → HIGH</option>
                    <option value="price-desc">PRICE: HIGH → LOW</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Dynamic Filter Controls (Desktop) (Section 8) */}
            <div className="hidden sm:flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[#100E0B] border border-[#221F18] text-xs font-mono">
              
              {/* Style Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#E8DDC8]/50 uppercase text-[10px]">STYLE:</span>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="bg-[#161410] border border-[#27241D] rounded px-2 py-1 text-xs text-[#E8DDC8] focus:outline-none"
                >
                  <option value="all">ALL 13 STYLES</option>
                  {POLAROID_STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Story Arc Filter */}
              {dynamicFilterOptions.arcs.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8DDC8]/50 uppercase text-[10px]">STORY ARC:</span>
                  <select
                    value={selectedArc}
                    onChange={(e) => setSelectedArc(e.target.value)}
                    className="bg-[#161410] border border-[#27241D] rounded px-2 py-1 text-xs text-[#E8DDC8] focus:outline-none max-w-[150px]"
                  >
                    <option value="all">ALL ARCS</option>
                    {dynamicFilterOptions.arcs.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Division / Squad Filter (Bleach) */}
              {dynamicFilterOptions.divisions.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8DDC8]/50 uppercase text-[10px]">SQUAD / DIVISION:</span>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="bg-[#161410] border border-[#27241D] rounded px-2 py-1 text-xs text-[#E8DDC8] focus:outline-none max-w-[160px]"
                  >
                    <option value="all">ALL DIVISIONS</option>
                    {dynamicFilterOptions.divisions.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Role / Faction Filter */}
              {dynamicFilterOptions.roles.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8DDC8]/50 uppercase text-[10px]">
                    {selectedCategory === 'cricket'
                      ? 'PLAYER ROLE:'
                      : selectedCategory === 'football'
                      ? 'POSITION:'
                      : selectedCategory === 'cars' || selectedCategory === 'bikes'
                      ? 'EDITION / SPEC:'
                      : selectedFranchise === 'Bleach'
                      ? 'FACTION:'
                      : selectedFranchise === 'One Piece'
                      ? 'CREW / FACTION:'
                      : 'FACTION / ROLE:'}
                  </span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-[#161410] border border-[#27241D] rounded px-2 py-1 text-xs text-[#E8DDC8] focus:outline-none max-w-[160px]"
                  >
                    <option value="all">ALL OPTIONS</option>
                    {dynamicFilterOptions.roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Subcategory Filter */}
              {dynamicFilterOptions.subcategories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8DDC8]/50 uppercase text-[10px]">COLLECTION:</span>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="bg-[#161410] border border-[#27241D] rounded px-2 py-1 text-xs text-[#E8DDC8] focus:outline-none max-w-[150px]"
                  >
                    <option value="all">ALL FORMATS</option>
                    {dynamicFilterOptions.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear All Filters Button (Section 10) */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="ml-auto text-xs font-mono text-[#F4B82A] hover:text-[#E8DDC8] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET FILTERS</span>
                </button>
              )}

            </div>

            {/* Active Removable Filters (Section 10) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-[#E8DDC8]/40 text-[10px] mr-1">ACTIVE FILTERS:</span>
                
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded bg-[#1C1A14] border border-[#2B2720] text-[#E8DDC8] flex items-center gap-1">
                    <span>&ldquo;{searchQuery}&rdquo;</span>
                    <button type="button" onClick={() => setSearchQuery('')} className="hover:text-[#F4B82A]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCategory !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-[#1C1A14] border border-[#2B2720] text-[#E8DDC8] flex items-center gap-1 uppercase">
                    <span>{selectedCategory}</span>
                    <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-[#F4B82A]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedFranchise !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-[#1C1A14] border border-[#2B2720] text-[#E8DDC8] flex items-center gap-1">
                    <span>{selectedFranchise}</span>
                    <button type="button" onClick={() => setSelectedFranchise('all')} className="hover:text-[#F4B82A]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedStyle !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-[#1C1A14] border border-[#2B2720] text-[#E8DDC8] flex items-center gap-1">
                    <span>{selectedStyle}</span>
                    <button type="button" onClick={() => setSelectedStyle('all')} className="hover:text-[#F4B82A]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedArc !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-[#1C1A14] border border-[#2B2720] text-[#E8DDC8] flex items-center gap-1">
                    <span>{selectedArc}</span>
                    <button type="button" onClick={() => setSelectedArc('all')} className="hover:text-[#F4B82A]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedRole !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-[#1C1A14] border border-[#2B2720] text-[#E8DDC8] flex items-center gap-1">
                    <span>{selectedRole}</span>
                    <button type="button" onClick={() => setSelectedRole('all')} className="hover:text-[#F4B82A]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedDivision !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-[#1C1A14] border border-[#2B2720] text-[#E8DDC8] flex items-center gap-1">
                    <span>{selectedDivision}</span>
                    <button type="button" onClick={() => setSelectedDivision('all')} className="hover:text-[#F4B82A]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* EMPTY STATE (Section 23) */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#181611] border border-[#27241D] flex items-center justify-center mx-auto text-[#F4B82A]">
                  <Search className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-['Syne'] text-lg font-bold text-[#E8DDC8]">
                    NO MOMENTS FOUND
                  </h3>
                  <p className="text-sm font-['Cormorant_Garamond'] italic text-[#E8DDC8]/60">
                    &ldquo;Your search didn&apos;t uncover anything in the archive.&rdquo;
                  </p>
                </div>
                
                {/* Popular searches suggestions (Section 23) */}
                <div className="pt-2 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#E8DDC8]/40">
                    TRY EXPLORING:
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {['ANIME', 'FOOTBALL', 'CRICKET', 'CARS', 'MOVIES', 'TRAVEL'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(sug.toLowerCase());
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1 rounded bg-[#14120E] border border-[#27241D] hover:border-[#F4B82A] text-xs font-mono text-[#E8DDC8]/80 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    CLEAR SEARCH &amp; FILTERS
                  </button>
                </div>
              </div>
            ) : (
              /* PRODUCTS GRID (2-column mobile, 3 tablet, 4 desktop) */
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {paginatedProducts.map((p) => (
                    <PolaroidCard
                      key={p.id}
                      product={p}
                      onInspect={(prod) => setInspectProduct(prod)}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>

                {/* Skeletons while loading more */}
                {isLoadingMore && <PolaroidSkeleton count={8} />}

                {/* Load More Pagination (Section 21) */}
                {hasMore && !isLoadingMore && (
                  <div className="pt-8 pb-4 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-8 py-3 bg-[#14120E] hover:bg-[#1C1A14] border border-[#27241D] hover:border-[#F4B82A] text-[#E8DDC8] hover:text-[#F4B82A] font-['Syne'] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>LOAD MORE PRINTS</span>
                      <span className="font-mono text-[10px] text-[#E8DDC8]/40">
                        ({filteredProducts.length - visibleCount} REMAINING)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM FILTER DRAWER (Section 26) */}
      {/* ============================================================ */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-xs sm:hidden">
          <div className="bg-[#14120E] border-t border-[#27241D] rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#221F18] pb-3">
              <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">
                ARCHIVE FILTERS
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-[#E8DDC8]/60 hover:text-[#E8DDC8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[#E8DDC8]/50 block mb-1">POLAROID STYLE</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-[#1A1813] border border-[#27241D] rounded p-2 text-[#E8DDC8]"
                >
                  <option value="all">ALL 13 STYLES</option>
                  {POLAROID_STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {dynamicFilterOptions.arcs.length > 0 && (
                <div>
                  <label className="text-[#E8DDC8]/50 block mb-1">STORY ARC</label>
                  <select
                    value={selectedArc}
                    onChange={(e) => setSelectedArc(e.target.value)}
                    className="w-full bg-[#1A1813] border border-[#27241D] rounded p-2 text-[#E8DDC8]"
                  >
                    <option value="all">ALL ARCS</option>
                    {dynamicFilterOptions.arcs.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {dynamicFilterOptions.divisions.length > 0 && (
                <div>
                  <label className="text-[#E8DDC8]/50 block mb-1">SQUAD / DIVISION</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full bg-[#1A1813] border border-[#27241D] rounded p-2 text-[#E8DDC8]"
                  >
                    <option value="all">ALL DIVISIONS</option>
                    {dynamicFilterOptions.divisions.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {dynamicFilterOptions.roles.length > 0 && (
                <div>
                  <label className="text-[#E8DDC8]/50 block mb-1">
                    {selectedCategory === 'cricket'
                      ? 'PLAYER ROLE'
                      : selectedCategory === 'football'
                      ? 'POSITION'
                      : selectedCategory === 'cars' || selectedCategory === 'bikes'
                      ? 'EDITION / SPEC'
                      : selectedFranchise === 'Bleach'
                      ? 'FACTION'
                      : selectedFranchise === 'One Piece'
                      ? 'CREW / FACTION'
                      : 'FACTION / ROLE'}
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-[#1A1813] border border-[#27241D] rounded p-2 text-[#E8DDC8]"
                  >
                    <option value="all">ALL OPTIONS</option>
                    {dynamicFilterOptions.roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="flex-1 py-2.5 rounded bg-[#1C1A14] text-[#E8DDC8] text-xs font-mono font-bold"
              >
                RESET
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded bg-[#F4B82A] text-[#0B0A08] text-xs font-mono font-bold"
              >
                APPLY ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PRODUCT DETAIL MODAL (Sections 15, 16, 20) */}
      {/* ============================================================ */}
      {inspectProduct && (
        <ProductDetailModal
          product={inspectProduct}
          allProducts={ARCHIVE_PRODUCTS}
          onSelectProduct={(p) => setInspectProduct(p)}
          onClose={() => setInspectProduct(null)}
          onAddToCart={onAddToCart}
          onOpenCustomizer={onOpenCustomizer}
        />
      )}

    </div>
  );
};
