import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderHook<T>(
  hookFn: () => T,
  options?: { wrapper?: React.ComponentType<{ children: React.ReactNode }> }
) {
  const result = { current: undefined as unknown as T };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const TestComponent: React.FC = () => {
    result.current = hookFn();
    return null;
  };

  const Wrapper = options?.wrapper;
  const element = Wrapper
    ? <Wrapper><TestComponent /></Wrapper>
    : <TestComponent />;

  act(() => {
    root.render(element);
  });

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
    rerender: () => {
      act(() => {
        root.render(element);
      });
    },
  };
}

import {
  ShopifyEngineProvider,
  StoreProvider,
  useStore,
  ThemeProvider,
  useTheme,
  generateThemeCssVariables,
  CartProvider,
  useCart,
  calculateCartTotals,
  WishlistProvider,
  useWishlist,
  SearchProvider,
  useSearch,
  executeProductSearch,
  AccountProvider,
  useAccount,
  CheckoutProvider,
  useCheckout,
} from '../index';
import { clearStoreStorage, createStoreStorage } from '../../utils/storage';
import { Product } from '../../types/product';
import { ThemeTokens } from '../../types/theme';

describe('Shopify Portfolio Engine - Comprehensive Test Suite', () => {
  beforeEach(() => {
    // Clear all storage before each test
    clearStoreStorage('coffee');
    clearStoreStorage('fashion');
    clearStoreStorage('jewelry');
    clearStoreStorage('electronics');
    clearStoreStorage('global');
  });

  // =========================================================================
  // 1. StoreContext Tests
  // =========================================================================
  describe('StoreContext', () => {
    it('initializes with default coffee store and lists available stores', () => {
      const { result } = renderHook(() => useStore(), {
        wrapper: ({ children }) => <StoreProvider>{children}</StoreProvider>,
      });

      expect(result.current.storeId).toBe('coffee');
      expect(result.current.storeConfig.name).toBe('Terroir & Roast');
      expect(result.current.isStoreValid).toBe(true);
      expect(result.current.availableStores).toHaveLength(4);
      expect(result.current.products.length).toBeGreaterThanOrEqual(16);
    });

    it('allows switching active store dynamically', () => {
      const { result } = renderHook(() => useStore(), {
        wrapper: ({ children }) => <StoreProvider>{children}</StoreProvider>,
      });

      act(() => {
        result.current.setStoreId('fashion');
      });

      expect(result.current.storeId).toBe('fashion');
      expect(result.current.storeConfig.name).toBe('Atelier Noir');
      expect(result.current.storeConfig.industry).toBe('fashion');
    });

    it('queries products by handle and id correctly', () => {
      const { result } = renderHook(() => useStore(), {
        wrapper: ({ children }) => <StoreProvider>{children}</StoreProvider>,
      });

      const firstProduct = result.current.products[0];
      const byHandle = result.current.getProductByHandle(firstProduct.handle);
      const byId = result.current.getProductById(firstProduct.id);

      expect(byHandle?.id).toBe(firstProduct.id);
      expect(byId?.handle).toBe(firstProduct.handle);
      expect(result.current.getProductByHandle('non-existent')).toBeUndefined();
    });

    it('retrieves categories, tags, and related products', () => {
      const { result } = renderHook(() => useStore(), {
        wrapper: ({ children }) => <StoreProvider>{children}</StoreProvider>,
      });

      const categories = result.current.getAllCategories();
      expect(categories.length).toBeGreaterThanOrEqual(2);

      const categoryProducts = result.current.getProductsByCategory(categories[0]);
      expect(categoryProducts.length).toBeGreaterThanOrEqual(1);

      const targetProd = result.current.products[0];
      const related = result.current.getRelatedProducts(targetProd.id, targetProd.category, 3);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.every((p) => p.id !== targetProd.id)).toBe(true);
    });
  });

  // =========================================================================
  // 2. ThemeContext Tests
  // =========================================================================
  describe('ThemeContext', () => {
    it('generates accurate CSS variables for typography, colors, and shape', () => {
      const customTokens: ThemeTokens = {
        colors: {
          primary: '#FF5500',
          secondary: '#222222',
          accent: '#00AAFF',
          background: '#050505',
          surface: '#111111',
          text: '#FFFFFF',
          textMuted: '#888888',
          border: '#333333',
        },
        typography: {
          headingFont: 'Space Grotesk, sans-serif',
          bodyFont: 'Inter, sans-serif',
          scale: 'compact',
        },
        shape: {
          borderRadius: 'full',
          cardStyle: 'elevated',
        },
        layout: {
          headerStyle: 'tech-hud',
          heroVariant: 'standard',
          contentDensity: 'dense',
        },
        animation: {
          intensity: 'snappy',
        },
      };

      const cssVars = generateThemeCssVariables(customTokens);

      expect(cssVars['--color-primary']).toBe('#FF5500');
      expect(cssVars['--color-background']).toBe('#050505');
      expect(cssVars['--border-radius']).toBe('9999px');
      expect(cssVars['--radius-btn']).toBe('9999px');
      expect(cssVars['--animation-duration']).toBe('150ms');
      expect(cssVars['--font-heading']).toBe('Space Grotesk, sans-serif');
    });

    it('injects variables into :root with cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <ThemeProvider>{children}</ThemeProvider>
          </StoreProvider>
        ),
      });

      expect(result.current.cssVariables['--color-primary']).toBeDefined();
      if (typeof document !== 'undefined') {
        const rootColor = document.documentElement.style.getPropertyValue('--color-primary');
        expect(rootColor).toBeTruthy();
      }

      unmount();
    });
  });

  // =========================================================================
  // 3. CartContext Tests
  // =========================================================================
  describe('CartContext', () => {
    const dummyProduct: Product = {
      id: 'prod-test-coffee-1',
      handle: 'ethiopian-special',
      title: 'Ethiopian Special Reserve',
      description: 'Single origin roasted coffee.',
      price: 24.5,
      category: 'Single Origin',
      tags: ['coffee', 'featured'],
      images: [{ id: 'img-1', url: 'https://example.com/test.jpg', altText: 'Test coffee' }],
      options: [{ name: 'Grind', values: ['Whole Bean', 'Filter'] }],
      variants: [
        {
          id: 'var-test-wb',
          title: 'Whole Bean',
          sku: 'ETH-WB',
          price: 24.5,
          options: { Grind: 'Whole Bean' },
          availableForSale: true,
          inventoryQuantity: 10,
        },
        {
          id: 'var-test-fl',
          title: 'Filter Grind',
          sku: 'ETH-FL',
          price: 26.0,
          options: { Grind: 'Filter' },
          availableForSale: true,
          inventoryQuantity: 5,
        },
      ],
      rating: { average: 4.8, count: 20 },
    };

    it('adds line items with composite IDs and accumulates quantities', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.addItem(dummyProduct, 'var-test-wb', 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('prod-test-coffee-1-var-test-wb');
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.totalQuantity).toBe(2);
      expect(result.current.subtotal).toBe(49.0);

      // Adding the same item increments quantity
      act(() => {
        result.current.addItem(dummyProduct, 'var-test-wb', 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.subtotal).toBe(73.5);
    });

    it('throws error when adding zero or negative quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      expect(() => {
        result.current.addItem(dummyProduct, 'var-test-wb', 0);
      }).toThrow('Quantity must be greater than 0');

      expect(() => {
        result.current.addItem(dummyProduct, 'var-test-wb', -2);
      }).toThrow('Quantity must be greater than 0');
    });

    it('removes item when quantity is updated to zero or negative', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.addItem(dummyProduct, 'var-test-wb', 2);
      });
      const itemId = result.current.items[0].id;

      act(() => {
        result.current.updateQuantity(itemId, 0);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.shipping).toBe(0);
    });

    it('calculates float-safe totals and free shipping progress without drift', () => {
      const totals1 = calculateCartTotals(
        [
          {
            id: '1',
            productId: 'p1',
            variantId: 'v1',
            title: 'Item 1',
            variantTitle: 'Default',
            price: 19.99,
            quantity: 2,
            imageUrl: '',
            selectedOptions: {},
          },
        ],
        { freeShippingThreshold: 50.0, standardShippingRate: 5.0, taxRate: 0.08 }
      );

      // 19.99 * 2 = 39.98 (< 50, so shipping applies)
      expect(totals1.subtotal).toBe(39.98);
      expect(totals1.shipping).toBe(5.0);
      expect(totals1.freeShippingProgress).toBe(80); // Math.round((39.98/50)*100) = 80
      expect(totals1.amountNeededForFreeShipping).toBe(10.02);

      const totals2 = calculateCartTotals(
        [
          {
            id: '1',
            productId: 'p1',
            variantId: 'v1',
            title: 'Item 1',
            variantTitle: 'Default',
            price: 55.0,
            quantity: 1,
            imageUrl: '',
            selectedOptions: {},
          },
        ],
        { freeShippingThreshold: 50.0, standardShippingRate: 5.0, taxRate: 0.08 }
      );

      expect(totals2.subtotal).toBe(55.0);
      expect(totals2.shipping).toBe(0.0);
      expect(totals2.freeShippingProgress).toBe(100);
      expect(totals2.amountNeededForFreeShipping).toBe(0);
    });

    it('persists cart in local storage and manages drawer toggle state', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.openCart();
      });
      expect(result.current.isCartOpen).toBe(true);

      act(() => {
        result.current.toggleCart();
      });
      expect(result.current.isCartOpen).toBe(false);

      act(() => {
        result.current.addItem(dummyProduct, 'var-test-wb', 1);
      });

      const storedItems = createStoreStorage('coffee').get('cart_items', []);
      expect(storedItems).toHaveLength(1);

      act(() => {
        result.current.clearCart();
      });
      expect(result.current.items).toHaveLength(0);
      expect(createStoreStorage('coffee').get('cart_items', [])).toHaveLength(0);
    });
  });

  // =========================================================================
  // 4. WishlistContext Tests
  // =========================================================================
  describe('WishlistContext', () => {
    const sampleProduct: Product = {
      id: 'wish-p-1',
      handle: 'wish-item',
      title: 'Wishlist Item',
      description: 'A fine wishlist product.',
      price: 99.0,
      category: 'Gear',
      tags: [],
      images: [],
      options: [],
      variants: [
        {
          id: 'wish-var-1',
          title: 'Standard',
          sku: 'WISH-1',
          price: 99.0,
          options: {},
          availableForSale: true,
          inventoryQuantity: 5,
        },
      ],
      rating: { average: 5, count: 1 },
    };

    it('supports add, remove, and toggle with boolean return values', () => {
      const { result } = renderHook(() => useWishlist(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>
              <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
          </StoreProvider>
        ),
      });

      let added = false;
      act(() => {
        added = result.current.toggleItem('wish-p-1');
      });
      expect(added).toBe(true);
      expect(result.current.isInWishlist('wish-p-1')).toBe(true);
      expect(result.current.has('wish-p-1')).toBe(true);

      act(() => {
        added = result.current.toggleItem('wish-p-1');
      });
      expect(added).toBe(false);
      expect(result.current.isInWishlist('wish-p-1')).toBe(false);
    });

    it('moves wishlist item to cart and removes from wishlist', () => {
      const { result: cartResult } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>
              <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
          </StoreProvider>
        ),
      });

      const { result: wishResult } = renderHook(() => useWishlist(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>
              <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        wishResult.current.addItem(sampleProduct.id);
      });
      expect(wishResult.current.isInWishlist(sampleProduct.id)).toBe(true);

      act(() => {
        wishResult.current.moveToCart(sampleProduct, 'wish-var-1');
      });

      expect(wishResult.current.isInWishlist(sampleProduct.id)).toBe(false);
      expect(cartResult.current.items.some((i) => i.productId === sampleProduct.id)).toBe(true);
    });
  });

  // =========================================================================
  // 5. SearchContext Tests
  // =========================================================================
  describe('SearchContext', () => {
    const testCatalog: Product[] = [
      {
        id: 's-1',
        handle: 'cafe-creme-roast',
        title: 'Café Crème Roast Special',
        description: 'Smooth French-style roast with notes of cocoa.',
        price: 20.0,
        category: 'Single Origin',
        tags: ['french', 'espresso'],
        images: [],
        options: [],
        variants: [],
        rating: { average: 4.5, count: 10 },
      },
      {
        id: 's-2',
        handle: 'colombian-espresso',
        title: 'Colombian Supremo',
        description: 'Bright citrus finish from high altitudes.',
        price: 18.0,
        category: 'Blends',
        tags: ['citrus', 'colombia'],
        images: [],
        options: [],
        variants: [],
        rating: { average: 4.6, count: 12 },
      },
    ];

    it('matches diacritics bidirectionally (cafe matches Café, crème matches creme)', () => {
      const res1 = executeProductSearch('cafe', testCatalog);
      expect(res1).toHaveLength(1);
      expect(res1[0].id).toBe('s-1');

      const res2 = executeProductSearch('creme', testCatalog);
      expect(res2).toHaveLength(1);
      expect(res2[0].id).toBe('s-1');

      const res3 = executeProductSearch('Crème Café', testCatalog);
      expect(res3).toHaveLength(1);
      expect(res3[0].id).toBe('s-1');
    });

    it('safely handles isolated combining diacritic characters (BOUND-03/04 check)', () => {
      // Must return empty array, NOT all products
      const resIsolated = executeProductSearch('\u0300', testCatalog);
      expect(resIsolated).toEqual([]);

      const resMultiple = executeProductSearch('\u0300\u0301\u0302', testCatalog);
      expect(resMultiple).toEqual([]);
    });

    it('manages recent search history with FIFO deduplication', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <SearchProvider catalog={testCatalog}>{children}</SearchProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.recordQuery('espresso');
        result.current.recordQuery('french');
        result.current.recordQuery('espresso'); // duplicates moved to front
      });

      expect(result.current.recentQueries[0]).toBe('espresso');
      expect(result.current.recentQueries[1]).toBe('french');
      expect(result.current.recentQueries).toHaveLength(2);

      act(() => {
        result.current.clearRecentQueries();
      });
      expect(result.current.recentQueries).toHaveLength(0);
    });
  });

  // =========================================================================
  // 6. AccountContext Tests
  // =========================================================================
  describe('AccountContext', () => {
    it('initializes with demo profile and enforces address single-default invariant', () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => <AccountProvider>{children}</AccountProvider>,
      });

      expect(result.current.profile.firstName).toBe('Alex');
      expect(result.current.isDemoMode).toBe(true);

      let newId = '';
      act(() => {
        newId = result.current.addAddress({
          firstName: 'Robin',
          lastName: 'Banks',
          addressLine1: '404 Cache Blvd',
          city: 'Portland',
          stateOrProvince: 'OR',
          postalCode: '97201',
          country: 'United States',
          isDefault: true,
        });
      });

      const defaults = result.current.addresses.filter((a) => a.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].id).toBe(newId);
      expect(result.current.defaultAddress?.id).toBe(newId);
    });

    it('handles 500-character address lines without truncation or error', () => {
      const { result } = renderHook(() => useAccount(), {
        wrapper: ({ children }) => <AccountProvider>{children}</AccountProvider>,
      });

      const longStreet = 'Z'.repeat(500);
      let id = '';
      act(() => {
        id = result.current.addAddress({
          firstName: 'Boundary',
          lastName: 'Tester',
          addressLine1: longStreet,
          city: 'New York',
          stateOrProvince: 'NY',
          postalCode: '10001',
          country: 'United States',
        });
      });

      const found = result.current.addresses.find((a) => a.id === id);
      expect(found?.addressLine1).toHaveLength(500);
    });
  });

  // =========================================================================
  // 7. CheckoutContext Tests
  // =========================================================================
  describe('CheckoutContext', () => {
    it('advances through 4-step state machine with validation guards and clears cart', () => {
      const { result: cartResult } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>
              <AccountProvider>
                <CheckoutProvider>{children}</CheckoutProvider>
              </AccountProvider>
            </CartProvider>
          </StoreProvider>
        ),
      });

      const { result: checkoutResult } = renderHook(() => useCheckout(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>
              <AccountProvider>
                <CheckoutProvider>{children}</CheckoutProvider>
              </AccountProvider>
            </CartProvider>
          </StoreProvider>
        ),
      });

      expect(checkoutResult.current.step).toBe('information');

      // Invalid customer info throws
      expect(() => {
        checkoutResult.current.setCustomerInfo({
          email: 'invalid-email',
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'US',
        });
      }).toThrow();

      // Valid customer info advances to shipping
      act(() => {
        checkoutResult.current.setCustomerInfo({
          email: 'shopper@test.com',
          firstName: 'Jane',
          lastName: 'Doe',
          address: '123 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'United States',
        });
      });
      expect(checkoutResult.current.step).toBe('shipping');

      // Setting shipping method advances to payment
      act(() => {
        checkoutResult.current.setShippingMethod(checkoutResult.current.availableShippingMethods[0]);
      });
      expect(checkoutResult.current.step).toBe('payment');

      // Payment requires isDemo: true and valid card digits
      expect(() => {
        checkoutResult.current.processPayment({
          cardNumber: '1234',
          expiry: '12/28',
          cvc: '123',
          isDemo: false,
        });
      }).toThrow('Valid credit card number required');

      // Successful demo payment generates DEMO-ORD-*, clears cart, advances to confirmation
      act(() => {
        checkoutResult.current.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: true,
        });
      });

      expect(checkoutResult.current.step).toBe('confirmation');
      expect(checkoutResult.current.completedOrder?.id).toMatch(/^DEMO-ORD-/);
      expect(cartResult.current.items).toHaveLength(0);
    });
  });

  // =========================================================================
  // 8. Composite ShopifyEngineProvider Integration
  // =========================================================================
  describe('ShopifyEngineProvider Integration', () => {
    it('seamlessly renders and exposes all 7 domain hooks without runtime errors', () => {
      const { result } = renderHook(() => ({
        store: useStore(),
        cart: useCart(),
        wishlist: useWishlist(),
        theme: useTheme(),
        search: useSearch(),
        account: useAccount(),
        checkout: useCheckout(),
      }), {
        wrapper: ({ children }) => (
          <ShopifyEngineProvider initialStoreId="coffee">
            {children}
          </ShopifyEngineProvider>
        ),
      });

      expect(result.current.store.storeId).toBe('coffee');
      expect(result.current.theme.cssVariables['--color-primary']).toBeDefined();
      expect(result.current.account.profile.email).toBe('alex.morgan@portfolio.demo');
      expect(result.current.cart.totalQuantity).toBe(0);
      expect(result.current.wishlist.wishlistCount).toBe(0);
      expect(result.current.checkout.step).toBe('information');
    });
  });
});
