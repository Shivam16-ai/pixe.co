import React, { useState } from 'react';
import { ChevronDown, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { ArchiveCategory } from '../../types';
import { ARCHIVE_CATEGORIES } from '../../data/archiveCatalog';
import { playPaperTapSound } from '../../utils/audio';

interface CategoryNavigationProps {
  selectedCategory: string;
  selectedSubcategory: string;
  selectedFranchise: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory: (subcategory: string) => void;
  onSelectFranchise: (franchise: string) => void;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  selectedCategory,
  selectedSubcategory,
  selectedFranchise,
  onSelectCategory,
  onSelectSubcategory,
  onSelectFranchise,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Active category definition
  const activeCat = ARCHIVE_CATEGORIES.find((c) => c.id === selectedCategory);
  const displayCat = ARCHIVE_CATEGORIES.find((c) => c.id === hoveredCategory) || activeCat;

  return (
    <div className="w-full bg-[#0E0D0B] border-y border-[#221F18] py-2 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Category Horizontal Index (Editorial Typography) */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none pb-1">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playPaperTapSound();
              onSelectCategory('all');
            }}
            className={`px-3 py-1.5 text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer rounded ${
              selectedCategory === 'all'
                ? 'bg-[#F4B82A] text-[#0B0A08] font-bold'
                : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
            }`}
          >
            ALL ARCHIVES
          </button>

          {ARCHIVE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => {
                  playPaperTapSound();
                  onSelectCategory(cat.id);
                }}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer rounded whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#1C1A14] text-[#F4B82A] font-bold border border-[#F4B82A]/40'
                    : 'text-[#E8DDC8]/60 hover:text-[#E8DDC8] hover:bg-[#15130F]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory & Franchise Reveal Drawer (Section 11 & 12) */}
      {displayCat && (displayCat.franchises?.length || displayCat.subcategories?.length) && (
        <div className="max-w-7xl mx-auto pt-2 pb-1 border-t border-[#1C1A14] mt-2 flex flex-wrap items-center gap-4 text-xs font-mono">
          
          {/* Franchise items for anime (Section 12) */}
          {displayCat.franchises && displayCat.franchises.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#E8DDC8]/40 uppercase text-[10px] mr-1">FRANCHISES:</span>
              {displayCat.franchises.map((fr) => {
                const isAll = fr === 'All Franchises';
                const isSelected = isAll ? selectedFranchise === 'all' : selectedFranchise === fr;
                return (
                  <button
                    key={fr}
                    type="button"
                    onClick={() => {
                      playPaperTapSound();
                      onSelectCategory(displayCat.id);
                      onSelectFranchise(isAll ? 'all' : fr);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4B82A] text-[#0B0A08] font-bold'
                        : 'bg-[#15130F] text-[#E8DDC8]/70 hover:text-[#E8DDC8] border border-[#27241D]'
                    }`}
                  >
                    {fr}
                  </button>
                );
              })}
            </div>
          )}

          {/* Subcategories (Section 11) */}
          {displayCat.subcategories && displayCat.subcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#E8DDC8]/40 uppercase text-[10px] mr-1">COLLECTIONS:</span>
              {displayCat.subcategories.map((sub) => {
                const isAll = sub === 'All' || sub === 'All Formats' || sub === 'All Movies';
                const isSelected = isAll ? selectedSubcategory === 'all' : selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      playPaperTapSound();
                      onSelectCategory(displayCat.id);
                      onSelectSubcategory(isAll ? 'all' : sub);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8DDC8] text-[#0B0A08] font-bold'
                        : 'bg-[#15130F] text-[#E8DDC8]/60 hover:text-[#E8DDC8] border border-[#221F18]'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
