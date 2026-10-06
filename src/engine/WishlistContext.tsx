/**
 * WishlistContext - Multi-Store Wishlist Engine & Move-to-Cart Workflow
 *
 * Implements:
 * - Persistent product bookmarking scoped by storeId
 * - Toggle, add, remove, and query operations with test-compatible aliases
 * - Move-to-cart integration with CartContext
 * - Multi-tab synchronization via src/utils/storage.ts
 * - Zero `any` types
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types/product';
import { createStoreStorage } from '../utils/storage';
import { StoreContext } from './StoreContext';
import { CartContext } from './CartContext';

export interface WishlistContextValue {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  has: (productId: string) => boolean;
  addItem: (productId: string) => void;
  add: (productId: string) => void;
  removeItem: (productId: string) => void;
  remove: (productId: string) => void;
  toggleItem: (productId: string) => boolean;
  toggle: (productId: string) => boolean;
  moveToCart: (product: Product, variantId?: string) => void;
  clearWishlist: () => void;
  clear: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
}

export const WishlistContext = createContext<WishlistContextValue | null>(null);

export interface WishlistProviderProps {
  storeId?: string;
  children?: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  storeId: explicitStoreId,
  children,
}) => {
  const storeContext = useContext(StoreContext);
  const cartContext = useContext(CartContext);

  const resolvedStoreId = explicitStoreId || storeContext?.storeId || 'global';
  const storage = useMemo(() => createStoreStorage(resolvedStoreId), [resolvedStoreId]);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    return storage.get<string[]>('wishlist', []);
  });

  const lastStoreIdRef = React.useRef(resolvedStoreId);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Sync state when active store changes
  useEffect(() => {
    const freshStorage = createStoreStorage(resolvedStoreId);
    if (lastStoreIdRef.current !== resolvedStoreId) {
      lastStoreIdRef.current = resolvedStoreId;
      setWishlistIds(freshStorage.get<string[]>('wishlist', []));
    }

    const unsubscribe = freshStorage.subscribe<string[]>('wishlist', (updated) => {
      setWishlistIds(Array.isArray(updated) ? updated : []);
    });

    return () => unsubscribe();
  }, [resolvedStoreId]);

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlistIds.includes(productId);
    },
    [wishlistIds]
  );

  const addItem = useCallback(
    (productId: string) => {
      if (!productId) return;
      setWishlistIds((prev) => {
        if (prev.includes(productId)) return prev;
        const next = [...prev, productId];
        storage.set('wishlist', next);
        return next;
      });
    },
    [storage]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setWishlistIds((prev) => {
        const next = prev.filter((id) => id !== productId);
        storage.set('wishlist', next);
        return next;
      });
    },
    [storage]
  );

  const toggleItem = useCallback(
    (productId: string): boolean => {
      if (!productId) return false;
      const willAdd = !wishlistIds.includes(productId);

      setWishlistIds((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        storage.set('wishlist', next);
        return next;
      });

      return willAdd;
    },
    [wishlistIds, storage]
  );

  const moveToCart = useCallback(
    (product: Product, variantId?: string) => {
      removeItem(product.id);
      if (cartContext) {
        cartContext.addItem(product, variantId, 1);
      }
    },
    [removeItem, cartContext]
  );

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
    storage.set('wishlist', []);
  }, [storage]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds,
      wishlistCount: wishlistIds.length,
      isInWishlist,
      has: isInWishlist,
      addItem,
      add: addItem,
      removeItem,
      remove: removeItem,
      toggleItem,
      toggle: toggleItem,
      moveToCart,
      clearWishlist,
      clear: clearWishlist,
      isWishlistOpen,
      setIsWishlistOpen,
    }),
    [
      wishlistIds,
      isInWishlist,
      addItem,
      removeItem,
      toggleItem,
      moveToCart,
      clearWishlist,
      isWishlistOpen,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = (): WishlistContextValue => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
