/**
 * SearchContext - Diacritic-Insensitive Search Index & Query State
 *
 * Implements:
 * - NFD Unicode diacritic-folding search matching accented and non-accented text
 * - Strict defense against isolated combining marks (preventing full catalog false-matches)
 * - Multi-token out-of-order query matching across title, description, category, and tags
 * - Multi-store persistent recent query history (FIFO / LIFO capped)
 * - Modal overlay controls with keyboard shortcuts (Cmd+K / Ctrl+K / Escape)
 * - Zero `any` types
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types/product';
import { createStoreStorage } from '../utils/storage';
import { StoreContext } from './StoreContext';

/**
 * Normalizes text for search via NFD Unicode decomposition,
 * combining diacritic stripping, and lowercasing.
 */
export function normalizeForSearch(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Searches a catalog of products across title, description, category, and tags.
 * Includes critical guard against isolated combining diacritic queries.
 */
export function executeProductSearch(query: string, catalog: Product[]): Product[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const normQuery = normalizeForSearch(trimmed).trim();

  // Critical guard: if query consisted only of combining diacritics (e.g., "\u0300"),
  // normQuery collapses to empty string; returning [] prevents matching everything.
  if (!normQuery) return [];

  const tokens = normQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return catalog.filter((product) => {
    const normTitle = normalizeForSearch(product.title);
    const normDesc = normalizeForSearch(product.description);
    const normCategory = normalizeForSearch(product.category);
    const normTags = (product.tags || []).map((t) => normalizeForSearch(t));

    const titleMatch = tokens.every((token) => normTitle.includes(token));
    const descMatch = tokens.every((token) => normDesc.includes(token));
    const catMatch = normCategory.includes(normQuery);
    const tagMatch = normTags.some((tag) => tag.includes(normQuery));

    const combinedText = `${normTitle} ${normDesc} ${normCategory} ${normTags.join(' ')}`;
    const compositeMatch = tokens.every((token) => combinedText.includes(token));

    return titleMatch || descMatch || catMatch || tagMatch || compositeMatch;
  });
}

// ---------------------------------------------------------------------------
// SearchContext Interface
// ---------------------------------------------------------------------------

export interface SearchContextValue {
  // Modal / overlay visibility
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  // Search input & results
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  results: Product[];
  isSearching: boolean;
  hasSearched: boolean;

  // Recent searches history
  recentQueries: string[];
  recordQuery: (query: string) => void;
  clearRecentQueries: () => void;
  removeRecentQuery: (query: string) => void;

  // Suggestions & direct search function
  suggestedQueries: string[];
  search: (query: string, customCatalog?: Product[]) => Product[];
}

export const SearchContext = createContext<SearchContextValue | null>(null);

export interface SearchProviderProps {
  catalog?: Product[];
  storeId?: string;
  maxRecent?: number;
  children?: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({
  catalog: explicitCatalog,
  storeId: explicitStoreId,
  maxRecent = 5,
  children,
}) => {
  const storeContext = useContext(StoreContext);
  const resolvedStoreId = explicitStoreId || storeContext?.storeId || 'global';
  const activeCatalog = explicitCatalog || storeContext?.products || [];

  const storage = useMemo(() => createStoreStorage(resolvedStoreId), [resolvedStoreId]);

  // Modal visibility & query
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [isSearching] = useState<boolean>(false);

  // Recent queries history
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    return storage.get<string[]>('recent_searches', []);
  });

  const lastStoreIdRef = React.useRef(resolvedStoreId);

  // Sync recent searches on store switch or cross-tab update
  useEffect(() => {
    const freshStorage = createStoreStorage(resolvedStoreId);
    if (lastStoreIdRef.current !== resolvedStoreId) {
      lastStoreIdRef.current = resolvedStoreId;
      setRecentQueries(freshStorage.get<string[]>('recent_searches', []));
    }

    const unsubscribe = freshStorage.subscribe<string[]>('recent_searches', (updated) => {
      setRecentQueries(Array.isArray(updated) ? updated : []);
    });

    return () => unsubscribe();
  }, [resolvedStoreId]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K to toggle, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);
  const toggleSearch = useCallback(() => setIsOpen((prev) => !prev), []);
  const clearQuery = useCallback(() => setQuery(''), []);

  const recordQuery = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) return;

      setRecentQueries((prev) => {
        const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, maxRecent);
        storage.set('recent_searches', updated);
        return updated;
      });
    },
    [storage, maxRecent]
  );

  const clearRecentQueries = useCallback(() => {
    setRecentQueries([]);
    storage.remove('recent_searches');
  }, [storage]);

  const removeRecentQuery = useCallback(
    (targetQuery: string) => {
      setRecentQueries((prev) => {
        const updated = prev.filter((q) => q.toLowerCase() !== targetQuery.toLowerCase());
        storage.set('recent_searches', updated);
        return updated;
      });
    },
    [storage]
  );

  // Search execution helper
  const search = useCallback(
    (searchQuery: string, customCatalog?: Product[]): Product[] => {
      return executeProductSearch(searchQuery, customCatalog || activeCatalog);
    },
    [activeCatalog]
  );

  // Active results derived from current query
  const results = useMemo(() => {
    return executeProductSearch(query, activeCatalog);
  }, [query, activeCatalog]);

  const hasSearched = useMemo(() => Boolean(query.trim()), [query]);

  // Dynamic suggested queries derived from catalog categories and tags
  const suggestedQueries = useMemo(() => {
    const categories = Array.from(new Set(activeCatalog.map((p) => p.category))).slice(0, 4);
    const tags = Array.from(new Set(activeCatalog.flatMap((p) => p.tags || []))).slice(0, 4);
    return Array.from(new Set([...categories, ...tags])).slice(0, 6);
  }, [activeCatalog]);

  const value = useMemo<SearchContextValue>(
    () => ({
      isOpen,
      setIsOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      query,
      setQuery,
      clearQuery,
      results,
      isSearching,
      hasSearched,
      recentQueries,
      recordQuery,
      clearRecentQueries,
      removeRecentQuery,
      suggestedQueries,
      search,
    }),
    [
      isOpen,
      openSearch,
      closeSearch,
      toggleSearch,
      query,
      clearQuery,
      results,
      isSearching,
      hasSearched,
      recentQueries,
      recordQuery,
      clearRecentQueries,
      removeRecentQuery,
      suggestedQueries,
      search,
    ]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = (): SearchContextValue => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
