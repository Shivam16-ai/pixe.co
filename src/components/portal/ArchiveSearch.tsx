import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, Flame, Eye, Command } from 'lucide-react';
import { ArchiveProduct } from '../../types';
import { PolaroidImage } from '../PolaroidImage';
import {
  generateSearchSuggestions,
  getSmartQuerySuggestions,
  SearchSuggestionItem,
} from '../../utils/archiveSearchEngine';
import { SearchHighlight } from './SearchHighlight';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';

interface ArchiveSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectProduct: (product: ArchiveProduct) => void;
  allProducts: ArchiveProduct[];
  totalMatches: number;
}

const POPULAR_SEARCH_TERMS = [
  { term: 'Luffy', subtitle: 'One Piece · Straw Hat Pirates' },
  { term: 'Lionel Messi', subtitle: 'World Cup 2022 Champion · Football' },
  { term: 'Virat Kohli', subtitle: 'Master of Chase · Cricket' },
  { term: 'Porsche 911', subtitle: '1976 930 Whale Tail · Automotive' },
  { term: 'Batman', subtitle: 'Dark Knight · DC Superheroes' },
  { term: 'Ichigo', subtitle: 'Substitute Soul Reaper · Bleach' },
  { term: 'Naruto', subtitle: 'Seventh Hokage · Hidden Leaf' },
  { term: 'Rengoku', subtitle: 'Flame Hashira · Demon Slayer' },
];

export const ArchiveSearch: React.FC<ArchiveSearchProps> = ({
  searchQuery,
  onSearchChange,
  onSelectProduct,
  allProducts,
  totalMatches,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [localInput, setLocalInput] = useState(searchQuery);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync if searchQuery changed externally (e.g. tag clicks, reset)
  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  // Debounce search query update to parent (180ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localInput !== searchQuery) {
        onSearchChange(localInput);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [localInput, searchQuery, onSearchChange]);

  // Compute live search suggestions with exact thumbnails (Section 5)
  const suggestions: SearchSuggestionItem[] = useMemo(() => {
    return generateSearchSuggestions(allProducts, localInput, 7);
  }, [localInput, allProducts]);

  // Compute smart keyword suggestions (Section 24)
  const keywordSuggestions = useMemo(() => {
    return getSmartQuerySuggestions(localInput, allProducts);
  }, [localInput, allProducts]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener ('/' or 'Cmd/Ctrl+K' to focus, 'Escape' to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

      // Pressing '/' when not typing in another input
      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      // Cmd+K or Ctrl+K shortcut (Section 6)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      // Escape key closes search dropdown
      if (e.key === 'Escape' && isFocused) {
        setIsFocused(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Handle keyboard navigation within suggestions (ArrowUp, ArrowDown, Enter)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const selected = suggestions[activeIndex];
        if (selected.product) {
          playShutterSound();
          onSelectProduct(selected.product);
          setIsFocused(false);
        } else {
          setLocalInput(selected.query);
          onSearchChange(selected.query);
          setIsFocused(false);
        }
      } else {
        // Submit current search
        onSearchChange(localInput);
        setIsFocused(false);
      }
    }
  };

  const handleClear = () => {
    playPaperTapSound();
    setLocalInput('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleSelectKeyword = (term: string) => {
    playPaperTapSound();
    setLocalInput(term);
    onSearchChange(term);
    setIsFocused(false);
  };

  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    if (item.product) {
      playShutterSound();
      onSelectProduct(item.product);
      setIsFocused(false);
    } else {
      playPaperTapSound();
      setLocalInput(item.query);
      onSearchChange(item.query);
      setIsFocused(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto select-none">
      
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center bg-[#13110E] border rounded-xl transition-all duration-200 ${
          isFocused
            ? 'border-[#F4B82A] shadow-[0_0_25px_rgba(244,184,42,0.18)] bg-[#171511]'
            : 'border-[#27241D] hover:border-[#3D372B]'
        }`}
      >
        <div className="pl-4 pr-2 text-[#E8DDC8]/40">
          <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-[#F4B82A]' : ''}`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search subjects, characters, teams, cars, movies, anime..."
          className="w-full py-3.5 pr-24 bg-transparent text-sm font-['Syne'] text-[#E8DDC8] placeholder-[#E8DDC8]/35 focus:outline-none"
        />

        {/* Clear Button */}
        {localInput && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="p-1 mr-2 text-[#E8DDC8]/40 hover:text-[#E8DDC8] transition-colors rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Keyboard Shortcut Hints */}
        <div className="hidden sm:flex items-center gap-1 pr-3 text-[#E8DDC8]/40 text-[10px] font-mono select-none">
          <span className="px-1.5 py-0.5 rounded bg-[#1C1A15] border border-[#27241D]">
            ⌘K
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#1C1A15] border border-[#27241D]">
            /
          </span>
        </div>
      </div>

      {/* Autocomplete Dropdown Panel (Sections 5 & 24) */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12100D] border border-[#27241D] rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] z-50 overflow-hidden divide-y divide-[#1F1C16] animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Autocomplete Results with exact thumbnails */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#E8DDC8]/45">
                <span>{localInput ? 'CANONICAL ARCHIVE MATCHES' : 'CURATED HIGHLIGHTS'}</span>
                {localInput && totalMatches > 0 && (
                  <span className="text-[#F4B82A]">{totalMatches} TOTAL PRINTS</span>
                )}
              </div>

              <div className="space-y-1">
                {suggestions.map((item, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <div
                      key={item.product?.id || `${item.title}-${idx}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelectSuggestion(item)}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                        isActive ? 'bg-[#1E1B15] text-[#F4B82A]' : 'hover:bg-[#181612] text-[#E8DDC8]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Tiny Exact Thumbnail (Section 5) */}
                        <div className="relative w-9 h-9 rounded bg-[#1C1A15] border border-[#27241D] overflow-hidden shrink-0 shadow-inner">
                          {item.image ? (
                            <PolaroidImage
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-[#E8DDC8]/30">
                              PIXÉ
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 text-left">
                          <div className="font-['Syne'] text-xs font-bold truncate">
                            <SearchHighlight text={item.title} query={localInput} />
                          </div>
                          <div className="text-[10px] font-mono text-[#E8DDC8]/50 truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#E8DDC8]/40 shrink-0 pl-2">
                        {isActive && (
                          <span className="hidden sm:inline-flex items-center gap-0.5 text-[#F4B82A]">
                            <span>OPEN</span>
                            <CornerDownLeft className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {!isActive && (
                          <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Smart Query Suggestions (Section 24) */}
          {keywordSuggestions.length > 0 && (
            <div className="p-3 bg-[#0E0D0A]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#E8DDC8]/40 mb-2">
                SUGGESTED DISCOVERY QUERIES
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywordSuggestions.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleSelectKeyword(kw)}
                    className="px-2.5 py-1 rounded bg-[#171511] hover:bg-[#F4B82A] hover:text-[#0B0A08] border border-[#27241D] text-[11px] font-mono text-[#E8DDC8]/80 transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Curated Quick Terms when query is empty */}
          {!localInput && (
            <div className="p-3 bg-[#0B0A08]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#E8DDC8]/40 mb-2">
                POPULAR ARCHIVE SEARCHES
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {POPULAR_SEARCH_TERMS.map((pop) => (
                  <button
                    key={pop.term}
                    type="button"
                    onClick={() => handleSelectKeyword(pop.term)}
                    className="p-2 rounded bg-[#13110E] hover:bg-[#1A1813] border border-[#221F18] hover:border-[#F4B82A]/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-['Syne'] text-xs font-bold text-[#E8DDC8] group-hover:text-[#F4B82A] truncate">
                      {pop.term}
                    </div>
                    <div className="text-[9px] font-mono text-[#E8DDC8]/40 truncate">
                      {pop.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
