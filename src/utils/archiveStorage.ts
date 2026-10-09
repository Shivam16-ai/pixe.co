import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'pixe_favorite_ids';
const RECENTLY_VIEWED_KEY = 'pixe_recently_viewed_ids';
const MAX_RECENTLY_VIEWED = 12;

export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().includes(id);
}

export function toggleFavoriteId(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getFavoriteIds();
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [id, ...current];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pixe_favorites_updated', { detail: { id, isFav: !exists } }));
    return !exists;
  } catch {
    return false;
  }
}

export function getRecentlyViewedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getRecentlyViewedIds();
    // Prepend, deduplicate, limit to MAX_RECENTLY_VIEWED
    const updated = [id, ...current.filter((item) => item !== id)].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pixe_recently_viewed_updated', { detail: { id } }));
  } catch {
    // ignore storage exceptions
  }
}

export function useArchiveStorage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteIds);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(getRecentlyViewedIds);

  useEffect(() => {
    const updateFavs = () => setFavoriteIds(getFavoriteIds());
    const updateRecent = () => setRecentlyViewedIds(getRecentlyViewedIds());

    window.addEventListener('pixe_favorites_updated', updateFavs);
    window.addEventListener('pixe_recently_viewed_updated', updateRecent);
    window.addEventListener('storage', updateFavs);
    window.addEventListener('storage', updateRecent);

    return () => {
      window.removeEventListener('pixe_favorites_updated', updateFavs);
      window.removeEventListener('pixe_recently_viewed_updated', updateRecent);
      window.removeEventListener('storage', updateFavs);
      window.removeEventListener('storage', updateRecent);
    };
  }, []);

  return {
    favoriteIds,
    recentlyViewedIds,
    toggleFavorite: toggleFavoriteId,
    isFavorite: (id: string) => favoriteIds.includes(id),
    addRecentlyViewed: addRecentlyViewedId,
  };
}
