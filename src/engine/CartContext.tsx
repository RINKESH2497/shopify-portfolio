/**
 * CartContext - Multi-Store Cart Engine & Precision Financial State
 *
 * Implements:
 * - Variant-aware line items with `${productId}-${variantId}` composite keys
 * - Quantity manipulation with zero/negative boundary handling
 * - Float-safe financial calculations (subtotal, shipping, tax, total)
 * - Free shipping progress bar (0 - 100) and delta calculations
 * - Namespaced storage persistence and multi-tab synchronization via src/utils/storage.ts
 * - Drawer toggle state management
 * - Zero `any` types
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { StoreConfig } from '../types/store';
import { createStoreStorage } from '../utils/storage';
import { StoreContext } from './StoreContext';

// ---------------------------------------------------------------------------
// Calculation Interfaces & Helpers
// ---------------------------------------------------------------------------

export interface CartCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingProgress: number; // 0 - 100 clamped
  amountNeededForFreeShipping: number;
  totalQuantity: number;
  discountAmount: number;
}

export function calculateCartTotals(
  items: CartItem[],
  storeConfig?: Partial<StoreConfig>,
  discountAmount: number = 0
): CartCalculation {
  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const threshold = typeof storeConfig?.freeShippingThreshold === 'number'
    ? storeConfig.freeShippingThreshold
    : 50.0;
  const standardShipping = typeof storeConfig?.standardShippingRate === 'number'
    ? storeConfig.standardShippingRate
    : 5.0;
  const taxRate = typeof storeConfig?.taxRate === 'number'
    ? storeConfig.taxRate
    : 0.08;

  // Free shipping condition
  const qualifiesForFreeShipping = subtotal >= threshold && subtotal > 0;
  const shipping = (qualifiesForFreeShipping || items.length === 0) ? 0.0 : standardShipping;

  const effectiveSubtotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const tax = Math.round((effectiveSubtotal * taxRate) * 100) / 100;
  const total = Math.round((effectiveSubtotal + shipping + tax) * 100) / 100;

  let freeShippingProgress = 0;
  let amountNeededForFreeShipping = 0;

  if (threshold > 0 && subtotal > 0) {
    freeShippingProgress = Math.min(100, Math.round((subtotal / threshold) * 100));
    amountNeededForFreeShipping = Math.max(0, Math.round((threshold - subtotal) * 100) / 100);
  }

  return {
    subtotal,
    shipping,
    tax,
    total,
    freeShippingThreshold: threshold,
    freeShippingProgress,
    amountNeededForFreeShipping,
    totalQuantity,
    discountAmount,
  };
}

// ---------------------------------------------------------------------------
// CartContext Interface
// ---------------------------------------------------------------------------

export interface CartContextValue extends CartCalculation {
  items: CartItem[];
  addItem: (product: Product, variantId?: string, quantity?: number) => CartItem;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clear: () => void; // Convenience alias
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  appliedDiscountCode: string | null;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export interface CartProviderProps {
  storeId?: string;
  storeConfig?: Partial<StoreConfig>;
  children?: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({
  storeId: explicitStoreId,
  storeConfig: explicitStoreConfig,
  children,
}) => {
  const storeContext = useContext(StoreContext);
  const resolvedStoreId = explicitStoreId || storeContext?.storeId || 'global';
  const resolvedStoreConfig = explicitStoreConfig || storeContext?.storeConfig;

  const storage = useMemo(() => createStoreStorage(resolvedStoreId), [resolvedStoreId]);

  // In-memory cart items initialized from store-specific local storage
  const [items, setItems] = useState<CartItem[]>(() => {
    return storage.get<CartItem[]>('cart_items', []);
  });

  const lastStoreIdRef = React.useRef(resolvedStoreId);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Sync state when active store changes
  useEffect(() => {
    const freshStorage = createStoreStorage(resolvedStoreId);
    if (lastStoreIdRef.current !== resolvedStoreId) {
      lastStoreIdRef.current = resolvedStoreId;
      setItems(freshStorage.get<CartItem[]>('cart_items', []));
    }

    // Listen for cross-tab or same-window storage updates
    const unsubscribe = freshStorage.subscribe<CartItem[]>('cart_items', (updated) => {
      setItems(Array.isArray(updated) ? updated : []);
    });

    return () => unsubscribe();
  }, [resolvedStoreId]);

  // Cart operations
  const addItem = useCallback(
    (product: Product, variantId?: string, quantity: number = 1): CartItem => {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const targetVariant = variantId
        ? product.variants.find((v) => v.id === variantId) || product.variants[0]
        : product.variants[0];

      if (!targetVariant) {
        throw new Error(`Variant not found on product ${product.id}`);
      }

      const lineItemId = `${product.id}-${targetVariant.id}`;
      let createdOrUpdatedItem: CartItem;

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.id === lineItemId);
        let nextItems: CartItem[];

        if (existingIndex > -1) {
          createdOrUpdatedItem = {
            ...prevItems[existingIndex],
            quantity: prevItems[existingIndex].quantity + quantity,
          };
          nextItems = [...prevItems];
          nextItems[existingIndex] = createdOrUpdatedItem;
        } else {
          createdOrUpdatedItem = {
            id: lineItemId,
            productId: product.id,
            variantId: targetVariant.id,
            title: product.title,
            variantTitle: targetVariant.title,
            price: targetVariant.price,
            quantity,
            imageUrl: targetVariant.imageUrl || (product.images[0]?.url ?? ''),
            selectedOptions: targetVariant.options || {},
          };
          nextItems = [...prevItems, createdOrUpdatedItem];
        }

        storage.set('cart_items', nextItems);
        return nextItems;
      });

      return createdOrUpdatedItem!;
    },
    [storage]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((prevItems) => {
        const nextItems = prevItems.filter((item) => item.id !== itemId);
        storage.set('cart_items', nextItems);
        return nextItems;
      });
    },
    [storage]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }

      setItems((prevItems) => {
        const nextItems = prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        storage.set('cart_items', nextItems);
        return nextItems;
      });
    },
    [removeItem, storage]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedDiscountCode(null);
    setDiscountAmount(0);
    storage.set('cart_items', []);
  }, [storage]);

  // Drawer toggles
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // Demo discount codes
  const applyDiscount = useCallback(
    (code: string): boolean => {
      const cleanCode = code.trim().toUpperCase();
      const rawSubtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

      if (cleanCode === 'WELCOME10') {
        setAppliedDiscountCode('WELCOME10');
        setDiscountAmount(Math.round(rawSubtotal * 0.1 * 100) / 100);
        return true;
      }
      if (cleanCode === 'SAVE20') {
        setAppliedDiscountCode('SAVE20');
        setDiscountAmount(Math.round(rawSubtotal * 0.2 * 100) / 100);
        return true;
      }
      if (cleanCode === 'FREESHIP') {
        setAppliedDiscountCode('FREESHIP');
        setDiscountAmount(resolvedStoreConfig?.standardShippingRate ?? 5.0);
        return true;
      }
      return false;
    },
    [items, resolvedStoreConfig]
  );

  const removeDiscount = useCallback(() => {
    setAppliedDiscountCode(null);
    setDiscountAmount(0);
  }, []);

  // Totals calculations
  const totals = useMemo(
    () => calculateCartTotals(items, resolvedStoreConfig, discountAmount),
    [items, resolvedStoreConfig, discountAmount]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clear: clearCart,
      isCartOpen,
      setIsCartOpen,
      toggleCart,
      openCart,
      closeCart,
      appliedDiscountCode,
      applyDiscount,
      removeDiscount,
      ...totals,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      toggleCart,
      openCart,
      closeCart,
      appliedDiscountCode,
      applyDiscount,
      removeDiscount,
      totals,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
