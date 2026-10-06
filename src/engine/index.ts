/**
 * Unified Shopify Engine Composition Root & Central Barrel
 *
 * Composes all 7 React context providers in exact dependency order:
 * 1. StoreProvider (outermost: storeId, active config, product catalog)
 * 2. ThemeProvider (injects CSS custom properties to :root from active store theme)
 * 3. AccountProvider (user profile, address book, simulated order history, demo banner)
 * 4. CartProvider (variant-aware items, line calculations, free shipping threshold, drawer)
 * 5. WishlistProvider (wishlist IDs, toggle, move-to-cart integration)
 * 6. SearchProvider (client-side diacritic-insensitive search index, recent queries)
 * 7. CheckoutProvider (4-step simulated checkout state machine, saves orders to AccountContext)
 *
 * Fully supports zero `any` types.
 */

import React from 'react';
import { StoreProvider, useStore, StoreContext } from './StoreContext';
import { ThemeProvider, useTheme, ThemeContext } from './ThemeContext';
import { AccountProvider, useAccount, AccountContext } from './AccountContext';
import { CartProvider, useCart, CartContext } from './CartContext';
import { WishlistProvider, useWishlist, WishlistContext } from './WishlistContext';
import { SearchProvider, useSearch, SearchContext } from './SearchContext';
import { CheckoutProvider, useCheckout, CheckoutContext } from './CheckoutContext';

// Re-export all contexts, providers, and hooks
export {
  StoreProvider,
  StoreContext,
  useStore,
  ThemeProvider,
  ThemeContext,
  useTheme,
  AccountProvider,
  AccountContext,
  useAccount,
  CartProvider,
  CartContext,
  useCart,
  WishlistProvider,
  WishlistContext,
  useWishlist,
  SearchProvider,
  SearchContext,
  useSearch,
  CheckoutProvider,
  CheckoutContext,
  useCheckout,
};

// Re-export types and calculation utilities
export * from './StoreContext';
export * from './ThemeContext';
export * from './AccountContext';
export * from './CartContext';
export * from './WishlistContext';
export * from './SearchContext';
export * from './CheckoutContext';

export interface ShopifyEngineProviderProps {
  children?: React.ReactNode;
  initialStoreId?: string;
  storeId?: string;
}

/**
 * Composite E-Commerce Engine Provider
 * Wraps application or page subtree with complete shared domain state.
 */
export const ShopifyEngineProvider: React.FC<ShopifyEngineProviderProps> = ({
  children,
  initialStoreId = 'coffee',
  storeId,
}) => {
  return React.createElement(
    StoreProvider,
    { initialStoreId, storeId },
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        AccountProvider,
        null,
        React.createElement(
          CartProvider,
          null,
          React.createElement(
            WishlistProvider,
            null,
            React.createElement(
              SearchProvider,
              null,
              React.createElement(CheckoutProvider, null, children)
            )
          )
        )
      )
    )
  );
};

export default ShopifyEngineProvider;
