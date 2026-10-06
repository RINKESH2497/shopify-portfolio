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
  const element = Wrapper ? <Wrapper><TestComponent /></Wrapper> : <TestComponent />;

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
  executeProductSearch,
  SearchProvider,
  useSearch,
} from '../SearchContext';

import {
  CheckoutProvider,
  useCheckout,
  CustomerInfo,
} from '../CheckoutContext';

import {
  CartProvider,
  useCart,
} from '../CartContext';

import {
  StoreProvider,
} from '../StoreContext';

import {
  AccountProvider,
  useAccount,
} from '../AccountContext';

import { Product } from '../../types/product';
import { clearStoreStorage, createStoreStorage } from '../../utils/storage';

function makeProduct(
  id: string,
  title: string,
  description = '',
  category = 'Coffee',
  tags: string[] = []
): Product {
  return {
    id,
    handle: `handle-${id}`,
    title,
    description,
    price: 25.0,
    category,
    tags,
    images: [{ id: 'img-1', url: 'https://example.com/p.jpg', altText: title }],
    options: [{ name: 'Size', values: ['Default'] }],
    variants: [
      {
        id: `v-${id}`,
        title: 'Default',
        sku: `SKU-${id}`,
        price: 25.0,
        options: { Size: 'Default' },
        availableForSale: true,
        inventoryQuantity: 20,
      },
    ],
    rating: { average: 4.8, count: 15 },
  };
}

const diacriticCatalog: Product[] = [
  makeProduct('p-cafe', 'Grand Café au Lait', 'Creamy espresso and steamed milk', 'Specialty Coffee', ['french', 'latte']),
  makeProduct('p-creme', 'Vanilla Crème Brulee Blend', 'Sweet vanilla and caramel notes', 'Flavored Coffee', ['creme', 'vanilla']),
  makeProduct('p-naive', 'Naïve Artisanal Silk Scarf', 'Delicate unaccented silk weave', 'Accessories', ['silk', 'luxury']),
  makeProduct('p-zurich', 'Zürich Automatic Chronometer', 'Precision Swiss automatic movement', 'Watches', ['swiss', 'luxury']),
  makeProduct('p-jalapeno', 'Spicy Jalapeño Dark Roast', 'Bold chili infused bean', 'Spicy', ['jalapeno', 'pepper']),
  makeProduct('p-angstrom', 'Ångström Precision Grinder', 'Nanometer burr accuracy', 'Equipment', ['burr', 'grinder']),
  makeProduct('p-facade', 'Haute Façade Trench Coat', 'Water resistant gabardine', 'Outerwear', ['coat', 'autumn']),
  makeProduct('p-dvorak', 'Dvořák Mechanical Keypad', 'Ergonomic switch layout', 'Hardware', ['switches', 'custom']),
  makeProduct('p-viet-tieng', 'Trà Tiếng Vang', 'Vietnamese highland green tea', 'Tea', ['tieng', 'vietnam']),
  makeProduct('p-viet-pho', 'Phở Gia Truyền Spice Blend', 'Star anise and cinnamon essence', 'Pantry', ['pho', 'herbs']),
  makeProduct('p-viet-nang', 'Đà Nẵng Single Origin Coffee', 'Central highland robusta bean', 'Coffee', ['nang', 'robusta']),
];

const sampleCustomer: CustomerInfo = {
  email: 'tester@shopify.portfolio',
  firstName: 'Morgan',
  lastName: 'Chase',
  address: '742 Evergreen Terrace',
  city: 'Springfield',
  state: 'OR',
  postalCode: '97477',
  country: 'United States',
};

describe('Challenger M2-2 Adversarial Stress Suite', () => {
  beforeEach(() => {
    clearStoreStorage('coffee');
    clearStoreStorage('fashion');
    clearStoreStorage('jewelry');
    clearStoreStorage('electronics');
    clearStoreStorage('global');
  });

  // =========================================================================
  // 1. Search Diacritics & Multilingual Accents
  // =========================================================================
  describe('Search Diacritics & Multilingual Accents', () => {
    it('S1.1: Unaccented query "cafe" matches accented title "Grand Café au Lait"', () => {
      const matches = executeProductSearch('cafe', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-cafe');
    });

    it('S1.2: Accented query "café" matches unaccented or accented titles', () => {
      const matches = executeProductSearch('café', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-cafe');
    });

    it('S1.3: Unaccented query "creme" matches accented title "Vanilla Crème Brulee Blend"', () => {
      const matches = executeProductSearch('creme', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-creme');
    });

    it('S1.4: Accented query "crème" matches title with "Crème"', () => {
      const matches = executeProductSearch('crème', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-creme');
    });

    it('S1.5: Unaccented query "naive" matches accented title "Naïve Artisanal Silk Scarf"', () => {
      const matches = executeProductSearch('naive', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-naive');
    });

    it('S1.6: Accented query "naïve" matches title "Naïve Artisanal Silk Scarf"', () => {
      const matches = executeProductSearch('naïve', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-naive');
    });

    it('S1.7: Unaccented query "zurich" matches accented title "Zürich Automatic Chronometer"', () => {
      const matches = executeProductSearch('zurich', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-zurich');
    });

    it('S1.8: Accented query "Zürich" matches title "Zürich Automatic Chronometer"', () => {
      const matches = executeProductSearch('Zürich', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-zurich');
    });

    it('S1.9: Spanish ñ: "jalapeno" matches "Spicy Jalapeño Dark Roast"', () => {
      const matches = executeProductSearch('jalapeno', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-jalapeno');
    });

    it('S1.10: Swedish å: "angstrom" matches "Ångström Precision Grinder"', () => {
      const matches = executeProductSearch('angstrom', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-angstrom');
    });

    it('S1.11: French ç: "facade" matches "Haute Façade Trench Coat"', () => {
      const matches = executeProductSearch('facade', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-facade');
    });

    it('S1.12: Czech ř: "dvorak" matches "Dvořák Mechanical Keypad"', () => {
      const matches = executeProductSearch('dvorak', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-dvorak');
    });

    it('S1.13: Vietnamese stacked accents: "tieng" matches "Trà Tiếng Vang"', () => {
      const matches = executeProductSearch('tieng', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-viet-tieng');
    });

    it('S1.14: Vietnamese horn+hook: "pho" matches "Phở Gia Truyền Spice Blend"', () => {
      const matches = executeProductSearch('pho', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-viet-pho');
    });

    it('S1.15: Vietnamese breve+tilde: "nang" matches "Đà Nẵng Single Origin Coffee"', () => {
      const matches = executeProductSearch('nang', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-viet-nang');
    });

    it('S1.16: NFC query vs NFD catalog product title equivalence', () => {
      const nfdTitle = 'Café'.normalize('NFD') + ' Roast';
      const customCatalog = [makeProduct('c-1', nfdTitle)];
      const nfcQuery = 'Café'.normalize('NFC');
      const matches = executeProductSearch(nfcQuery, customCatalog);
      expect(matches).toHaveLength(1);
    });

    it('S1.17: NFD query vs NFC catalog product title equivalence', () => {
      const nfcTitle = 'Café'.normalize('NFC') + ' Roast';
      const customCatalog = [makeProduct('c-1', nfcTitle)];
      const nfdQuery = 'Café'.normalize('NFD');
      const matches = executeProductSearch(nfdQuery, customCatalog);
      expect(matches).toHaveLength(1);
    });

    it('S1.18: Case-insensitive with diacritics: uppercase query "CAFÉ" matches "Grand Café au Lait"', () => {
      const matches = executeProductSearch('CAFÉ', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-cafe');
    });
  });

  // =========================================================================
  // 2. Search Isolated Combining Accents & Boundary Safety
  // =========================================================================
  describe('Search Isolated Combining Accents & Boundaries', () => {
    it('S2.1: Empty query string returns empty array', () => {
      const matches = executeProductSearch('', diacriticCatalog);
      expect(matches).toEqual([]);
    });

    it('S2.2: Whitespace-only query string returns empty array', () => {
      const matches = executeProductSearch('     \t\r\n   ', diacriticCatalog);
      expect(matches).toEqual([]);
    });

    it('S2.3: Isolated combining grave accent "\\u0300" returns empty array (BOUND-03)', () => {
      // Critical check: Must NOT leak entire catalog!
      const matches = executeProductSearch('\u0300', diacriticCatalog);
      expect(matches).toEqual([]);
    });

    it('S2.4: Multiple isolated combining marks "\\u0300\\u0301\\u0302" return empty array (BOUND-04)', () => {
      const matches = executeProductSearch('\u0300\u0301\u0302', diacriticCatalog);
      expect(matches).toEqual([]);
    });

    it('S2.5: Combining marks with spaces "  \\u0300  \\u0301  " return empty array', () => {
      const matches = executeProductSearch('  \u0300  \u0301  ', diacriticCatalog);
      expect(matches).toEqual([]);
    });

    it('S2.6: Isolated combining mark followed by letter "\\u0300cafe" normalizes and matches "cafe"', () => {
      const matches = executeProductSearch('\u0300cafe', diacriticCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-cafe');
    });

    it('S2.7: Large 5,000 character query string executes safely without catastrophic slowdown', () => {
      const hugeQuery = 'coffee '.repeat(1000);
      const start = Date.now();
      const matches = executeProductSearch(hugeQuery, diacriticCatalog);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(300);
      expect(Array.isArray(matches)).toBe(true);
    });

    it('S2.8: Regex special characters in query string do NOT throw syntax errors', () => {
      const specialChars = '.*+?^${}()|[]\\';
      const matches = executeProductSearch(specialChars, diacriticCatalog);
      expect(matches).toEqual([]);
    });
  });

  // =========================================================================
  // 3. Multi-Token Out-of-Order Search Queries
  // =========================================================================
  describe('Multi-Token Out-of-Order Search', () => {
    const multiTokenCatalog: Product[] = [
      makeProduct('p-dark-roast', 'Artisan Dark Roast Coffee Blend', 'Full-bodied dark roast from Sumatra', 'Blends', ['organic', 'whole-bean']),
      makeProduct('p-light-roast', 'Ethiopian Light Roast Citrus Finish', 'Bright floral and tea-like acidity', 'Single Origin', ['ethiopia', 'citrus']),
    ];

    it('S3.1: Natural order query "dark roast" matches product', () => {
      const matches = executeProductSearch('dark roast', multiTokenCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-dark-roast');
    });

    it('S3.2: Out-of-order query "roast dark" matches product', () => {
      const matches = executeProductSearch('roast dark', multiTokenCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-dark-roast');
    });

    it('S3.3: Three-token out-of-order query "blend dark roast" matches product', () => {
      const matches = executeProductSearch('blend dark roast', multiTokenCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-dark-roast');
    });

    it('S3.4: Cross-field tokens spanning Title and Tag ("coffee organic") match composite', () => {
      const matches = executeProductSearch('coffee organic', multiTokenCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-dark-roast');
    });

    it('S3.5: Cross-field tokens spanning Title and Description ("dark sumatra") match composite', () => {
      const matches = executeProductSearch('dark sumatra', multiTokenCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-dark-roast');
    });

    it('S3.6: Non-matching token ("dark roast decaf") rejects product', () => {
      const matches = executeProductSearch('dark roast decaf', multiTokenCatalog);
      expect(matches).toHaveLength(0);
    });

    it('S3.7: Query with redundant spaces "   dark      roast    " matches product', () => {
      const matches = executeProductSearch('   dark      roast    ', multiTokenCatalog);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('p-dark-roast');
    });
  });

  // =========================================================================
  // 4. SearchContext Hook & Overlay State
  // =========================================================================
  describe('SearchContext Hook & State', () => {
    it('S4.1: Overlay controls open, close, and toggle properly', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <SearchProvider catalog={diacriticCatalog}>{children}</SearchProvider>
          </StoreProvider>
        ),
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.openSearch();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggleSearch();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggleSearch();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeSearch();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('S4.2: Recent queries recording, deduplication, and FIFO/LIFO capping', () => {
      const { result } = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <SearchProvider catalog={diacriticCatalog} maxRecent={4}>{children}</SearchProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        result.current.recordQuery('espresso');
        result.current.recordQuery('latte');
        result.current.recordQuery('cappuccino');
        result.current.recordQuery('ESPRESSO'); // Should deduplicate case-insensitively and move to front
      });

      expect(result.current.recentQueries).toEqual(['ESPRESSO', 'cappuccino', 'latte']);

      act(() => {
        result.current.recordQuery('mocha');
        result.current.recordQuery('americano'); // Exceeds maxRecent = 4
      });

      expect(result.current.recentQueries).toHaveLength(4);
      expect(result.current.recentQueries[0]).toBe('americano');

      act(() => {
        result.current.removeRecentQuery('mocha');
      });
      expect(result.current.recentQueries.includes('mocha')).toBe(false);

      act(() => {
        result.current.clearRecentQueries();
      });
      expect(result.current.recentQueries).toHaveLength(0);
    });

    it('S4.3: Multi-store isolation for recent queries between coffee and fashion', () => {
      // Coffee session
      const coffeeHook = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="coffee">
            <SearchProvider storeId="coffee">{children}</SearchProvider>
          </StoreProvider>
        ),
      });

      act(() => {
        coffeeHook.result.current.recordQuery('ethiopian beans');
      });
      expect(coffeeHook.result.current.recentQueries).toEqual(['ethiopian beans']);
      coffeeHook.unmount();

      // Fashion session
      const fashionHook = renderHook(() => useSearch(), {
        wrapper: ({ children }) => (
          <StoreProvider initialStoreId="fashion">
            <SearchProvider storeId="fashion">{children}</SearchProvider>
          </StoreProvider>
        ),
      });

      expect(fashionHook.result.current.recentQueries).toEqual([]);
      act(() => {
        fashionHook.result.current.recordQuery('silk blazer');
      });
      expect(fashionHook.result.current.recentQueries).toEqual(['silk blazer']);
      fashionHook.unmount();

      // Re-verify coffee storage was isolated
      const coffeeStored = createStoreStorage('coffee').get<string[]>('recent_searches', []);
      expect(coffeeStored).toEqual(['ethiopian beans']);
    });
  });

  // =========================================================================
  // 5. Checkout State Machine Step Transitions & Illegal Step-Skipping
  // =========================================================================
  describe('Checkout State Machine Step Transitions', () => {
    it('C5.1: Initial step is strictly "information"', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(result.current.step).toBe('information');
      expect(result.current.customerInfo).toBeNull();
      expect(result.current.shippingMethod).toBeNull();
      expect(result.current.completedOrder).toBeNull();
    });

    it('C5.2: Illegal step skip to "shipping" throws without customerInfo', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(() => {
        result.current.goToStep('shipping');
      }).toThrow('Customer information required');
    });

    it('C5.3: Illegal step skip to "payment" throws without shippingMethod', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(() => {
        result.current.goToStep('payment');
      }).toThrow('Shipping method required');
    });

    it('C5.4: Illegal step skip to "confirmation" throws without completed payment', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(() => {
        result.current.goToStep('confirmation');
      }).toThrow('Payment completion required');
    });

    it('C5.5: Premature setShippingMethod throws before customerInfo is provided', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(() => {
        result.current.setShippingMethod(result.current.availableShippingMethods[0]);
      }).toThrow('Cannot set shipping before information step');
    });

    it('C5.6: Premature processPayment throws before shipping step', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(() => {
        result.current.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: true,
        });
      }).toThrow('Cannot process payment before shipping step');
    });

    it('C5.7: Valid forward sequence transitions through all 4 steps', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      act(() => {
        result.current.setCustomerInfo(sampleCustomer);
      });
      expect(result.current.step).toBe('shipping');

      act(() => {
        result.current.setShippingMethod(result.current.availableShippingMethods[0]);
      });
      expect(result.current.step).toBe('payment');

      act(() => {
        result.current.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: true,
        });
      });
      expect(result.current.step).toBe('confirmation');
      expect(result.current.completedOrder).not.toBeNull();
    });

    it('C5.8: Backwards step navigation allows stepping back without data loss', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      act(() => {
        result.current.setCustomerInfo(sampleCustomer);
      });
      act(() => {
        result.current.setShippingMethod(result.current.availableShippingMethods[0]);
      });
      expect(result.current.step).toBe('payment');

      act(() => {
        result.current.goToStep('shipping');
      });
      expect(result.current.step).toBe('shipping');

      act(() => {
        result.current.goToStep('information');
      });
      expect(result.current.step).toBe('information');

      act(() => {
        result.current.goToStep('payment');
      });
      expect(result.current.step).toBe('payment');
    });
  });

  // =========================================================================
  // 6. Checkout Validation & Demo Mode Security
  // =========================================================================
  describe('Checkout Validation & Demo Mode Security', () => {
    it('C6.1: Invalid emails are rejected with validation error', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      const invalidEmails = ['', 'no-at-sign', 'plainaddress', '   '];
      for (const email of invalidEmails) {
        expect(() => {
          result.current.setCustomerInfo({ ...sampleCustomer, email });
        }).toThrow('Invalid email address');
      }
    });

    it('C6.2: Missing or whitespace first and last names are rejected', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(() => {
        result.current.setCustomerInfo({ ...sampleCustomer, firstName: '   ' });
      }).toThrow('First and last name are required');

      expect(() => {
        result.current.setCustomerInfo({ ...sampleCustomer, lastName: '' });
      }).toThrow('First and last name are required');
    });

    it('C6.3: Missing address, city, or postal code are rejected', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      expect(() => {
        result.current.setCustomerInfo({ ...sampleCustomer, address: '   ' });
      }).toThrow('Complete shipping address required');

      expect(() => {
        result.current.setCustomerInfo({ ...sampleCustomer, city: '' });
      }).toThrow('Complete shipping address required');

      expect(() => {
        result.current.setCustomerInfo({ ...sampleCustomer, postalCode: '   ' });
      }).toThrow('Complete shipping address required');
    });

    it('C6.4: Card number with fewer than 13 digits is rejected', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      act(() => {
        result.current.setCustomerInfo(sampleCustomer);
      });
      act(() => {
        result.current.setShippingMethod(result.current.availableShippingMethods[0]);
      });

      const shortCards = ['', '1234', '4111 2222 3333']; // 0, 4, 12 digits
      for (const card of shortCards) {
        expect(() => {
          result.current.processPayment({
            cardNumber: card,
            expiry: '12/28',
            cvc: '123',
            isDemo: true,
          });
        }).toThrow('Valid credit card number required');
      }
    });

    it('C6.5: Payment with isDemo: false is strictly rejected', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      act(() => {
        result.current.setCustomerInfo(sampleCustomer);
      });
      act(() => {
        result.current.setShippingMethod(result.current.availableShippingMethods[0]);
      });

      expect(() => {
        result.current.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: false,
        });
      }).toThrow('Demo transaction confirmation required');
    });
  });

  // =========================================================================
  // 7. Order Generation, Cart Clearance & Financial Integrity
  // =========================================================================
  describe('Order Generation, Cart Clearance & Integrity', () => {
    it('C7.1: Successful payment completely clears cart items, subtotal, and quantity', () => {
      let cartValue: any;
      let checkoutValue: any;

      renderHook(() => {
        cartValue = useCart();
        checkoutValue = useCheckout();
      }, {
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

      act(() => {
        cartValue.addItem(diacriticCatalog[0], undefined, 3);
      });
      expect(cartValue.items).toHaveLength(1);
      expect(cartValue.subtotal).toBeGreaterThan(0);

      act(() => {
        checkoutValue.setCustomerInfo(sampleCustomer);
      });
      act(() => {
        checkoutValue.setShippingMethod(checkoutValue.availableShippingMethods[0]);
      });
      act(() => {
        checkoutValue.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: true,
        });
      });

      expect(cartValue.items).toHaveLength(0);
      expect(cartValue.subtotal).toBe(0);
      expect(cartValue.totalQuantity).toBe(0);
    });

    it('C7.2: Generated order conforms to universal Order schema and matches line item totals', () => {
      let cartValue: any;
      let checkoutValue: any;

      renderHook(() => {
        cartValue = useCart();
        checkoutValue = useCheckout();
      }, {
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

      act(() => {
        cartValue.addItem(diacriticCatalog[0], undefined, 2);
        cartValue.addItem(diacriticCatalog[1], undefined, 1);
      });

      let generatedOrder: any;
      act(() => {
        checkoutValue.setCustomerInfo(sampleCustomer);
      });
      act(() => {
        checkoutValue.setShippingMethod(checkoutValue.availableShippingMethods[0]);
      });
      act(() => {
        generatedOrder = checkoutValue.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: true,
        });
      });

      expect(generatedOrder.id).toMatch(/^DEMO-ORD-/);
      expect(generatedOrder.orderNumber).toMatch(/^#\d{4}$/);
      expect(generatedOrder.storeId).toBe('coffee');
      expect(generatedOrder.status).toBe('processing');
      expect(generatedOrder.paymentStatus).toBe('paid');
      expect(generatedOrder.items).toHaveLength(2);
      expect(generatedOrder.shippingAddress.addressLine1).toBe('742 Evergreen Terrace');
      expect(generatedOrder.total).toBe(
        Math.round((generatedOrder.subtotal + generatedOrder.shipping + generatedOrder.tax - generatedOrder.discount) * 100) / 100
      );
    });

    it('C7.3: Order is persisted into AccountContext order history and store storage', () => {
      let checkoutValue: any;
      let accountValue: any;

      renderHook(() => {
        checkoutValue = useCheckout();
        accountValue = useAccount();
      }, {
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

      act(() => {
        checkoutValue.setCustomerInfo(sampleCustomer);
      });
      act(() => {
        checkoutValue.setShippingMethod(checkoutValue.availableShippingMethods[0]);
      });
      act(() => {
        checkoutValue.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: true,
        });
      });

      const orderId = checkoutValue.completedOrder.id;
      expect(accountValue.orders.some((o: any) => o.id === orderId)).toBe(true);

      const storeOrders = createStoreStorage('coffee').get<any[]>('order_history', []);
      expect(storeOrders.some((o: any) => o.id === orderId)).toBe(true);
    });

    it('C7.4: Order ID uniqueness across 30 sequential orders', () => {
      let checkoutValue: any;

      renderHook(() => {
        checkoutValue = useCheckout();
      }, {
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

      const ids = new Set<string>();
      for (let i = 0; i < 30; i++) {
        act(() => {
          checkoutValue.resetCheckout();
        });
        act(() => {
          checkoutValue.setCustomerInfo(sampleCustomer);
        });
        act(() => {
          checkoutValue.setShippingMethod(checkoutValue.availableShippingMethods[0]);
        });
        act(() => {
          const ord = checkoutValue.processPayment({
            cardNumber: '4111 1111 1111 1111',
            expiry: '12/28',
            cvc: '123',
            isDemo: true,
          });
          ids.add(ord.id);
        });
      }

      expect(ids.size).toBe(30);
    });

    it('C7.5: resetCheckout completely resets checkout state back to step 1', () => {
      const { result } = renderHook(() => useCheckout(), {
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

      act(() => {
        result.current.setCustomerInfo(sampleCustomer);
      });
      act(() => {
        result.current.setShippingMethod(result.current.availableShippingMethods[0]);
      });
      act(() => {
        result.current.processPayment({
          cardNumber: '4111 1111 1111 1111',
          expiry: '12/28',
          cvc: '123',
          isDemo: true,
        });
      });
      expect(result.current.step).toBe('confirmation');

      act(() => {
        result.current.resetCheckout();
      });

      expect(result.current.step).toBe('information');
      expect(result.current.customerInfo).toBeNull();
      expect(result.current.shippingMethod).toBeNull();
      expect(result.current.completedOrder).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  // =========================================================================
  // 8. Shipping Methods Derivation & Free Shipping Qualification
  // =========================================================================
  describe('Shipping Methods Derivation', () => {
    it('S8.1: Below threshold ($25 < $50), Standard and Express are offered without Free', () => {
      let cartValue: any;
      let checkoutValue: any;

      renderHook(() => {
        cartValue = useCart();
        checkoutValue = useCheckout();
      }, {
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

      act(() => {
        cartValue.addItem(diacriticCatalog[0], undefined, 1); // $25
      });

      const methods = checkoutValue.availableShippingMethods;
      expect(methods.some((m: any) => m.id === 'standard')).toBe(true);
      expect(methods.some((m: any) => m.id === 'express')).toBe(true);
      expect(methods.some((m: any) => m.id === 'free')).toBe(false);
    });

    it('S8.2: At or above threshold ($50 >= $50), Free shipping is offered with rate 0', () => {
      let cartValue: any;
      let checkoutValue: any;

      renderHook(() => {
        cartValue = useCart();
        checkoutValue = useCheckout();
      }, {
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

      act(() => {
        cartValue.addItem(diacriticCatalog[0], undefined, 2); // $50
      });

      const methods = checkoutValue.availableShippingMethods;
      const freeMethod = methods.find((m: any) => m.id === 'free');
      expect(freeMethod).toBeDefined();
      expect(freeMethod.rate).toBe(0.0);
      expect(methods.some((m: any) => m.id === 'standard')).toBe(false);
      expect(methods.some((m: any) => m.id === 'express')).toBe(true);
    });
  });
});
