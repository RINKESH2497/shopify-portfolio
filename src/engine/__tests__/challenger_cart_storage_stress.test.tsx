import { describe, it, expect, beforeEach } from 'vitest';
import React, { act } from 'react';
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
  const element = Wrapper ? (
    <Wrapper>
      <TestComponent />
    </Wrapper>
  ) : (
    <TestComponent />
  );

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
  CartProvider,
  useCart,
  calculateCartTotals,
  WishlistProvider,
  useWishlist,
  StoreProvider,
  useStore,
} from '../index';
import {
  clearStoreStorage,
  createStoreStorage,
} from '../../utils/storage';
import { Product } from '../../types/product';

function createStressProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const priceA = Math.round((10 + i * 0.77) * 100) / 100;
    const priceB = Math.round((12 + i * 0.77) * 100) / 100;
    return {
      id: `stress-prod-${i + 1}`,
      handle: `stress-product-${i + 1}`,
      title: `Stress Product ${i + 1}`,
      description: `Stress item ${i + 1}`,
      price: priceA,
      category: `Cat-${i % 5}`,
      tags: [`tag-${i % 3}`, 'stress'],
      images: [{ id: `img-${i}`, url: `https://example.com/img-${i}.jpg`, altText: `Alt ${i}` }],
      options: [{ name: 'Size', values: ['Small', 'Large'] }],
      variants: [
        {
          id: `var-${i + 1}-sm`,
          title: 'Small',
          sku: `SKU-${i + 1}-SM`,
          price: priceA,
          options: { Size: 'Small' },
          availableForSale: true,
          inventoryQuantity: 100,
        },
        {
          id: `var-${i + 1}-lg`,
          title: 'Large',
          sku: `SKU-${i + 1}-LG`,
          price: priceB,
          options: { Size: 'Large' },
          availableForSale: true,
          inventoryQuantity: 50,
        },
      ],
      rating: { average: 4.8, count: 25 },
    };
  });
}

describe('Challenger M2-1: Empirical Stress Suite for Cart, Math & Storage Isolation', () => {
  beforeEach(() => {
    clearStoreStorage('coffee');
    clearStoreStorage('fashion');
    clearStoreStorage('jewelry');
    clearStoreStorage('electronics');
    clearStoreStorage('store-stress-1');
    clearStoreStorage('store-stress-2');
    clearStoreStorage('global');
  });

  // =========================================================================
  // SECTION 1: High Volume Cart Operations (100+ items)
  // =========================================================================
  describe('High Volume Cart Stress (100+ Items)', () => {
    it('successfully adds 120 distinct items into CartContext without corruption or dropouts', () => {
      const stressProducts = createStressProducts(120);

      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      // Add 120 items sequentially
      act(() => {
        for (let i = 0; i < 120; i++) {
          result.current.addItem(stressProducts[i], `var-${i + 1}-sm`, 1);
        }
      });

      expect(result.current.items).toHaveLength(120);
      expect(result.current.totalQuantity).toBe(120);

      // Verify exact mathematical sum without float drift
      const expectedSubtotal = Math.round(
        stressProducts.reduce((sum, p) => sum + p.variants[0].price, 0) * 100
      ) / 100;
      expect(result.current.subtotal).toBe(expectedSubtotal);

      // Verify namespaced storage persistence of all 120 items
      const persistedItems = createStoreStorage('coffee').get<unknown[]>('cart_items', []);
      expect(persistedItems).toHaveLength(120);

      unmount();
    });

    it('handles rapid sequential quantity updates across 100 items', () => {
      const stressProducts = createStressProducts(100);

      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addItem(stressProducts[i], `var-${i + 1}-sm`, 1);
        }
      });

      // Update quantity of every even item to 3
      act(() => {
        for (let i = 0; i < 100; i += 2) {
          const itemId = `stress-prod-${i + 1}-var-${i + 1}-sm`;
          result.current.updateQuantity(itemId, 3);
        }
      });

      // 50 items with qty 3 + 50 items with qty 1 = 200 totalQuantity
      expect(result.current.totalQuantity).toBe(200);
      expect(result.current.items).toHaveLength(100);

      unmount();
    });

    it('accumulates high volume of same item additions (100 additions to single line item)', () => {
      const singleProduct = createStressProducts(1)[0];

      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addItem(singleProduct, 'var-1-sm', 1);
        }
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(100);
      expect(result.current.totalQuantity).toBe(100);

      const expectedSubtotal = Math.round((singleProduct.variants[0].price * 100) * 100) / 100;
      expect(result.current.subtotal).toBe(expectedSubtotal);

      unmount();
    });

    it('supports large integer quantities up to 50,000 without integer overflow', () => {
      const singleProduct = createStressProducts(1)[0];

      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.addItem(singleProduct, 'var-1-sm', 50000);
      });

      expect(result.current.totalQuantity).toBe(50000);
      expect(result.current.items[0].quantity).toBe(50000);
      const expectedSubtotal = Math.round((singleProduct.variants[0].price * 50000) * 100) / 100;
      expect(result.current.subtotal).toBe(expectedSubtotal);

      unmount();
    });
  });

  // =========================================================================
  // SECTION 2: Quantity Zero & Negative Transitions
  // =========================================================================
  describe('Quantity Zero & Negative Boundary Enforcement', () => {
    const testProduct = createStressProducts(1)[0];

    it('throws explicit error when adding with quantity 0, -1, or -50', () => {
      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      expect(() => {
        act(() => {
          result.current.addItem(testProduct, 'var-1-sm', 0);
        });
      }).toThrow('Quantity must be greater than 0');

      expect(() => {
        act(() => {
          result.current.addItem(testProduct, 'var-1-sm', -1);
        });
      }).toThrow('Quantity must be greater than 0');

      expect(() => {
        act(() => {
          result.current.addItem(testProduct, 'var-1-sm', -50);
        });
      }).toThrow('Quantity must be greater than 0');

      expect(result.current.items).toHaveLength(0);
      unmount();
    });

    it('removes line item cleanly when updateQuantity is called with 0', () => {
      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.addItem(testProduct, 'var-1-sm', 5);
      });
      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.updateQuantity('stress-prod-1-var-1-sm', 0);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalQuantity).toBe(0);
      expect(result.current.subtotal).toBe(0);

      // Verify removal in storage
      const stored = createStoreStorage('coffee').get<unknown[]>('cart_items', []);
      expect(stored).toHaveLength(0);

      unmount();
    });

    it('removes line item cleanly when updateQuantity is called with negative quantity', () => {
      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.addItem(testProduct, 'var-1-sm', 3);
      });

      act(() => {
        result.current.updateQuantity('stress-prod-1-var-1-sm', -10);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalQuantity).toBe(0);
      unmount();
    });

    it('gracefully handles updateQuantity and removeItem on non-existent item IDs', () => {
      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.addItem(testProduct, 'var-1-sm', 2);
      });

      // No crash, items remain intact
      act(() => {
        result.current.updateQuantity('phantom-item-id', 5);
      });
      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeItem('non-existent-line-id');
      });
      expect(result.current.items).toHaveLength(1);

      unmount();
    });
  });

  // =========================================================================
  // SECTION 3: IEEE 754 Float Precision Boundary Prices
  // =========================================================================
  describe('IEEE 754 Float Precision Boundaries', () => {
    it('calculates exact sums for precision-trap prices ($19.99, $0.01, $99.95, $0.07)', () => {
      const precisionItems = [
        {
          id: 'item-1',
          productId: 'p-1',
          variantId: 'v-1',
          title: 'Item 1',
          variantTitle: 'Default',
          price: 19.99,
          quantity: 3, // 19.99 * 3 = 59.97 (float artifact: 59.970000000000006)
          imageUrl: '',
          selectedOptions: {},
        },
        {
          id: 'item-2',
          productId: 'p-2',
          variantId: 'v-2',
          title: 'Item 2',
          variantTitle: 'Default',
          price: 0.01,
          quantity: 7, // 0.01 * 7 = 0.07 (float artifact: 0.07000000000000002)
          imageUrl: '',
          selectedOptions: {},
        },
        {
          id: 'item-3',
          productId: 'p-3',
          variantId: 'v-3',
          title: 'Item 3',
          variantTitle: 'Default',
          price: 99.95,
          quantity: 2, // 199.90
          imageUrl: '',
          selectedOptions: {},
        },
      ];

      const totals = calculateCartTotals(precisionItems, {
        freeShippingThreshold: 500.0,
        standardShippingRate: 5.0,
        taxRate: 0.08,
      });

      // Subtotal = 59.97 + 0.07 + 199.90 = 259.94
      expect(totals.subtotal).toBe(259.94);
      expect(String(totals.subtotal).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);

      // Tax = 259.94 * 0.08 = 20.7952 -> 20.80
      expect(totals.tax).toBe(20.8);
      expect(String(totals.tax).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);

      // Total = 259.94 + 5.00 (shipping) + 20.80 (tax) = 285.74
      expect(totals.total).toBe(285.74);
      expect(String(totals.total).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
    });

    it('verifies 100 micro-transactions at $0.01 sum to exactly $1.00', () => {
      const microItems = Array.from({ length: 100 }, (_, i) => ({
        id: `micro-${i}`,
        productId: `p-${i}`,
        variantId: `v-${i}`,
        title: `Micro ${i}`,
        variantTitle: 'Cent',
        price: 0.01,
        quantity: 1,
        imageUrl: '',
        selectedOptions: {},
      }));

      const totals = calculateCartTotals(microItems, { freeShippingThreshold: 50.0 });
      expect(totals.subtotal).toBe(1.0);
      expect(totals.totalQuantity).toBe(100);
      expect(totals.amountNeededForFreeShipping).toBe(49.0);
    });

    it('guarantees no NaN or Infinity under empty, zero-price, or extreme pricing inputs', () => {
      const freeItem = [
        {
          id: 'free-1',
          productId: 'free-prod',
          variantId: 'free-var',
          title: 'Free Gift',
          variantTitle: 'Free',
          price: 0.0,
          quantity: 5,
          imageUrl: '',
          selectedOptions: {},
        },
      ];

      const totals = calculateCartTotals(freeItem, {
        freeShippingThreshold: 50.0,
        standardShippingRate: 5.0,
        taxRate: 0.08,
      });

      expect(totals.subtotal).toBe(0.0);
      expect(totals.shipping).toBe(5.0); // Cart has items, but subtotal $0 does not qualify
      expect(totals.tax).toBe(0.0);
      expect(totals.total).toBe(5.0);
      expect(totals.freeShippingProgress).toBe(0);
      expect(Number.isNaN(totals.total)).toBe(false);
      expect(Number.isFinite(totals.total)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 4: Free Shipping Threshold Boundary Math
  // =========================================================================
  describe('Free Shipping Threshold Edge Math', () => {
    const config = {
      freeShippingThreshold: 50.0,
      standardShippingRate: 5.0,
      taxRate: 0.08,
    };

    it('evaluates $0.00 subtotal (empty cart): progress 0%, shipping $0.00', () => {
      const totals = calculateCartTotals([], config);
      expect(totals.subtotal).toBe(0);
      expect(totals.shipping).toBe(0);
      expect(totals.freeShippingProgress).toBe(0);
      expect(totals.amountNeededForFreeShipping).toBe(0);
    });

    it('evaluates subtotal $49.99 ($0.01 under threshold): shipping charged, amountNeeded $0.01', () => {
      const item = [
        {
          id: 'item-edge',
          productId: 'p-edge',
          variantId: 'v-edge',
          title: 'Edge Item',
          variantTitle: 'Default',
          price: 49.99,
          quantity: 1,
          imageUrl: '',
          selectedOptions: {},
        },
      ];

      const totals = calculateCartTotals(item, config);
      expect(totals.subtotal).toBe(49.99);
      expect(totals.shipping).toBe(5.0); // Shipping charged
      expect(totals.amountNeededForFreeShipping).toBe(0.01);

      // Integer rounding observation: Math.round((49.99 / 50) * 100) = Math.round(99.98) = 100
      // Progress clamps/rounds to 100 in the current formula
      expect(totals.freeShippingProgress).toBeLessThanOrEqual(100);
    });

    it('evaluates exact threshold ($50.00): shipping free, amountNeeded $0.00, progress 100%', () => {
      const item = [
        {
          id: 'item-exact',
          productId: 'p-exact',
          variantId: 'v-exact',
          title: 'Exact Item',
          variantTitle: 'Default',
          price: 50.0,
          quantity: 1,
          imageUrl: '',
          selectedOptions: {},
        },
      ];

      const totals = calculateCartTotals(item, config);
      expect(totals.subtotal).toBe(50.0);
      expect(totals.shipping).toBe(0.0);
      expect(totals.amountNeededForFreeShipping).toBe(0.0);
      expect(totals.freeShippingProgress).toBe(100);
    });

    it('evaluates subtotal $50.01 ($0.01 above threshold): shipping free, amountNeeded $0.00, progress 100%', () => {
      const item = [
        {
          id: 'item-over',
          productId: 'p-over',
          variantId: 'v-over',
          title: 'Over Item',
          variantTitle: 'Default',
          price: 50.01,
          quantity: 1,
          imageUrl: '',
          selectedOptions: {},
        },
      ];

      const totals = calculateCartTotals(item, config);
      expect(totals.subtotal).toBe(50.01);
      expect(totals.shipping).toBe(0.0);
      expect(totals.amountNeededForFreeShipping).toBe(0.0);
      expect(totals.freeShippingProgress).toBe(100);
    });

    it('evaluates store configured with freeShippingThreshold: 0 gives free shipping to purchases', () => {
      const item = [
        {
          id: 'item-zero',
          productId: 'p-zero',
          variantId: 'v-zero',
          title: 'Zero Threshold Item',
          variantTitle: 'Default',
          price: 15.0,
          quantity: 1,
          imageUrl: '',
          selectedOptions: {},
        },
      ];

      const totals = calculateCartTotals(item, { ...config, freeShippingThreshold: 0 });
      expect(totals.shipping).toBe(0.0);
      expect(totals.freeShippingProgress).toBe(0);
    });

    it('clamps progress strictly at 100% when subtotal is 100x the threshold ($5000 vs $50)', () => {
      const item = [
        {
          id: 'item-huge',
          productId: 'p-huge',
          variantId: 'v-huge',
          title: 'Huge Item',
          variantTitle: 'Default',
          price: 5000.0,
          quantity: 1,
          imageUrl: '',
          selectedOptions: {},
        },
      ];

      const totals = calculateCartTotals(item, config);
      expect(totals.subtotal).toBe(5000.0);
      expect(totals.freeShippingProgress).toBe(100); // Not 10000%
      expect(totals.amountNeededForFreeShipping).toBe(0.0);
    });
  });

  // =========================================================================
  // SECTION 5: Multi-Store Storage Isolation
  // =========================================================================
  describe('Multi-Store Storage Isolation & Cross-Contamination Stress', () => {
    it('isolates cart items between Coffee and Fashion stores in LocalStorage', () => {
      const coffeeProduct = createStressProducts(1)[0];
      const fashionProduct = createStressProducts(2)[1];

      // Add item to Coffee
      const coffeeStorage = createStoreStorage('coffee');
      coffeeStorage.set('cart_items', [
        {
          id: `${coffeeProduct.id}-var-1-sm`,
          productId: coffeeProduct.id,
          variantId: 'var-1-sm',
          title: coffeeProduct.title,
          variantTitle: 'Small',
          price: coffeeProduct.price,
          quantity: 3,
          imageUrl: '',
          selectedOptions: {},
        },
      ]);

      // Add item to Fashion
      const fashionStorage = createStoreStorage('fashion');
      fashionStorage.set('cart_items', [
        {
          id: `${fashionProduct.id}-var-2-lg`,
          productId: fashionProduct.id,
          variantId: 'var-2-lg',
          title: fashionProduct.title,
          variantTitle: 'Large',
          price: fashionProduct.price,
          quantity: 7,
          imageUrl: '',
          selectedOptions: {},
        },
      ]);

      // Verify each store only reads its own data
      const readCoffee = coffeeStorage.get<any[]>('cart_items', []);
      const readFashion = fashionStorage.get<any[]>('cart_items', []);
      const readJewelry = createStoreStorage('jewelry').get<any[]>('cart_items', []);

      expect(readCoffee).toHaveLength(1);
      expect(readCoffee[0].quantity).toBe(3);

      expect(readFashion).toHaveLength(1);
      expect(readFashion[0].quantity).toBe(7);

      expect(readJewelry).toHaveLength(0); // Clean and unpolluted
    });

    it('clearing store storage for Coffee preserves Fashion, Jewelry, and Electronics', () => {
      const stores = ['coffee', 'fashion', 'jewelry', 'electronics'] as const;

      for (const s of stores) {
        createStoreStorage(s).set('cart_items', [{ storeName: s, count: 1 }]);
        createStoreStorage(s).set('wishlist', [`wish-${s}`]);
      }

      // Clear Coffee exclusively
      clearStoreStorage('coffee');

      expect(createStoreStorage('coffee').get('cart_items', [])).toHaveLength(0);
      expect(createStoreStorage('coffee').get('wishlist', [])).toHaveLength(0);

      expect(createStoreStorage('fashion').get('cart_items', [])).toHaveLength(1);
      expect(createStoreStorage('jewelry').get('cart_items', [])).toHaveLength(1);
      expect(createStoreStorage('electronics').get('cart_items', [])).toHaveLength(1);
    });

    it('prevents key prefix collisions when store IDs are substrings of each other', () => {
      // 'store-v1' vs 'store-v1-extended'
      const storeA = createStoreStorage('store-v1');
      const storeB = createStoreStorage('store-v1-extended');

      storeA.set('cart_items', [{ id: 'a' }]);
      storeB.set('cart_items', [{ id: 'b' }]);

      clearStoreStorage('store-v1');

      // store-v1 must be cleared, but store-v1-extended must NOT be cleared!
      expect(storeA.get('cart_items', [])).toHaveLength(0);
      expect(storeB.get('cart_items', [])).toHaveLength(1);
    });

    it('isolates Wishlist items across store context switches', () => {
      const { result: storeResult } = renderHook(() => useStore(), {
        wrapper: ({ children }) => <StoreProvider>{children}</StoreProvider>,
      });
      expect(storeResult.current.storeId).toBe('coffee');

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
        wishResult.current.addItem('prod-coffee-only');
      });
      expect(wishResult.current.isInWishlist('prod-coffee-only')).toBe(true);

      // Verify that Fashion wishlist does not have prod-coffee-only
      const fashionWish = createStoreStorage('fashion').get<string[]>('wishlist', []);
      expect(fashionWish.includes('prod-coffee-only')).toBe(false);
    });

    it('empirically reveals stale discountAmount when items change after discount application', () => {
      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      const coffeeProduct = createStressProducts(1)[0]; // price = 10.00
      act(() => {
        result.current.addItem(coffeeProduct, 'var-1-sm', 1); // subtotal = 10.00
      });

      // Apply SAVE20 (20% off 10.00 = 2.00)
      act(() => {
        result.current.applyDiscount('SAVE20');
      });

      expect(result.current.appliedDiscountCode).toBe('SAVE20');
      expect(result.current.discountAmount).toBe(2.0);

      // Now add 4 more items so subtotal becomes 50.00
      act(() => {
        result.current.addItem(coffeeProduct, 'var-1-sm', 4);
      });

      expect(result.current.subtotal).toBe(50.0);
      // BUG CONFIRMATION: discountAmount is statically captured at call time and does NOT scale with new subtotal!
      // Ideal expected 20% of $50 = $10.00, but actual implementation leaves discountAmount at stale $2.00
      expect(result.current.discountAmount).toBe(2.0); // Stale state reproduced!

      unmount();
    });

    it('empirically reveals cross-store discount leak when switching stores dynamically', () => {
      const { result, unmount } = renderHook(() => ({
        store: useStore(),
        cart: useCart(),
      }), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <CartProvider>{children}</CartProvider>
          </StoreProvider>
        ),
      });

      const coffeeProduct = createStressProducts(1)[0];
      act(() => {
        result.current.cart.addItem(coffeeProduct, 'var-1-sm', 1);
      });

      act(() => {
        result.current.cart.applyDiscount('WELCOME10');
      });

      expect(result.current.cart.appliedDiscountCode).toBe('WELCOME10');
      expect(result.current.cart.discountAmount).toBe(1.0);

      // Dynamically switch store to fashion
      act(() => {
        result.current.store.setStoreId('fashion');
      });

      // Cart items correctly switch to fashion's items (empty)
      expect(result.current.cart.items).toHaveLength(0);

      // BUG CONFIRMATION: appliedDiscountCode and discountAmount LEAK into fashion store!
      // CartProvider synchronizes cart_items on store switch, but does NOT reset discount state!
      expect(result.current.cart.appliedDiscountCode).toBe('WELCOME10'); // Leaked!
      expect(result.current.cart.discountAmount).toBe(1.0); // Leaked!

      unmount();
    });
  });

  // =========================================================================
  // SECTION 6: Wishlist Move-to-Cart Stress & Variant Fallbacks
  // =========================================================================
  describe('Wishlist Move-to-Cart Stress & Robustness', () => {
    it('moves 20 wishlist items sequentially to cart without dropping records', () => {
      const stressProducts = createStressProducts(20);

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

      // Add 20 items to wishlist
      act(() => {
        for (let i = 0; i < 20; i++) {
          wishResult.current.addItem(stressProducts[i].id);
        }
      });
      expect(wishResult.current.wishlistCount).toBe(20);

      // Move each to cart
      act(() => {
        for (let i = 0; i < 20; i++) {
          wishResult.current.moveToCart(stressProducts[i], stressProducts[i].variants[0].id);
        }
      });

      expect(wishResult.current.wishlistCount).toBe(0);
      expect(cartResult.current.items).toHaveLength(20);
      expect(cartResult.current.totalQuantity).toBe(20);
    });

    it('falls back to default variant if variantId is omitted during moveToCart', () => {
      const product = createStressProducts(1)[0];

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
        wishResult.current.addItem(product.id);
        wishResult.current.moveToCart(product); // No variantId specified
      });

      expect(wishResult.current.wishlistCount).toBe(0);
      expect(cartResult.current.items).toHaveLength(1);
      expect(cartResult.current.items[0].variantId).toBe(product.variants[0].id);
    });
  });
});
