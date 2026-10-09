import React from 'react';
import { Heart, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { ArchiveProduct, CartItem } from '../../types';
import { PolaroidCard } from '../PolaroidCard';
import { useArchiveStorage } from '../../utils/archiveStorage';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';

interface FavoritesViewProps {
  allProducts: ArchiveProduct[];
  onSelectProduct: (product: ArchiveProduct) => void;
  onAddToCart: (item: CartItem) => void;
  onExploreShop: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  allProducts,
  onSelectProduct,
  onAddToCart,
  onExploreShop,
}) => {
  const { favoriteIds } = useArchiveStorage();

  const savedProducts = React.useMemo(() => {
    return favoriteIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean) as ArchiveProduct[];
  }, [favoriteIds, allProducts]);

  const handleQuickAdd = (product: ArchiveProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    playShutterSound();
    const item: CartItem = {
      id: `${product.id}-fav-${Date.now()}`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none text-left space-y-8">
      
      {/* Editorial Header */}
      <div className="border-b border-[#221F18] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F4B82A] mb-1">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>CURATED COLLECTION</span>
        </div>
        <h1 className="font-['Syne'] text-2xl sm:text-3xl font-extrabold text-[#E8DDC8]">
          SAVED POLAROIDS
        </h1>
        <p className="font-['Cormorant_Garamond'] italic text-lg text-[#E8DDC8]/70 mt-1">
          &ldquo;Your private collection of moments worth holding onto.&rdquo;
        </p>
      </div>

      {/* Empty State (Section 14) */}
      {savedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#181611] border border-[#27241D] flex items-center justify-center mx-auto text-[#F4B82A]/60">
            <Heart className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-['Syne'] text-lg font-bold text-[#E8DDC8]">
              Nothing saved yet.
            </h3>
            <p className="text-sm font-['Cormorant_Garamond'] italic text-[#E8DDC8]/60">
              Build your own little archive.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                onExploreShop();
              }}
              className="px-5 py-2.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>EXPLORE THE ARCHIVE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Saved Items Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#E8DDC8]/60">
            <span>{savedProducts.length} COLLECTED MOMENTS</span>
            <span>STANDARD ARCHIVAL FORMAT (3.5×4.2&quot;)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {savedProducts.map((p) => (
              <PolaroidCard
                key={p.id}
                product={p}
                onInspect={onSelectProduct}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
