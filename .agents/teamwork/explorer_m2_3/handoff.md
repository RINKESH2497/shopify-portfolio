# Technical Handoff Report: Account Engine, Provider Composition & Build Alignment

**Agent**: `explorer_m2_3` (teamwork_preview_explorer)  
**Date**: 2026-10-06T04:14:00Z  
**Target Milestone**: Milestone 2 (`src/engine/AccountContext.tsx`, `src/engine/index.ts`, test alignment, build verification)  
**Target Audience**: Worker agent implementing Milestone 2  

---

## 1. Observation

### 1.1 Verbatim Compiler Error TS6133 & Build Failure
Running `npx tsc --noEmit` or `npm run build` currently exits with code 1 and outputs verbatim:
```text
src/components/common/__tests__/Drawer.test.tsx(2,8): error TS6133: 'React' is declared but its value is never read.
src/components/common/__tests__/Modal.test.tsx(2,8): error TS6133: 'React' is declared but its value is never read.
```
Inspecting `src/components/common/__tests__/Drawer.test.tsx` at line 2:
```tsx
import React, { act, useState } from 'react';
```
Inspecting `src/components/common/__tests__/Modal.test.tsx` at line 2:
```tsx
import React, { act, useState } from 'react';
```
In `tsconfig.json`, the compiler is configured with:
```json
"jsx": "react-jsx",
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"include": ["src", "tests"]
```
Because `"jsx": "react-jsx"` uses the automatic JSX runtime (`_jsx` from `react/jsx-runtime`), the identifier `React` is never referenced in either file. With `"noUnusedLocals": true`, the unreferenced default import `React` triggers a fatal compilation error TS6133.

### 1.2 Test Suite Execution Baseline
1. **E2E Test Runner**:
   Command: `npm run test:e2e` (`tsx tests/test-runner.ts`)  
   Result: **188/188 passed** (0 failed) in 10ms across all 4 tiers (Tier 1: 84, Tier 2: 78, Tier 3: 20, Tier 4: 6).  
2. **Vitest Unit Test Suite**:
   Command: `npm test` (`vitest run`)  
   Result: **3 test files, 35/35 passed** (`types.test.ts`, `Drawer.test.tsx`, `Modal.test.tsx`) in 1.49s.  
3. **TypeScript / Production Build**:
   Command: `npm run build` (`tsc && vite build`)  
   Result: **Failed on `tsc`** due strictly and solely to the two TS6133 unused import errors in `Drawer.test.tsx:2` and `Modal.test.tsx:2`.

### 1.3 Existing Type Contracts in `src/types/order.ts`
`src/types/order.ts` defines complete domain models with zero `any` types:
- `Address`: `id`, `firstName`, `lastName`, `company?`, `addressLine1`, `addressLine2?`, `city`, `stateOrProvince`, `postalCode`, `country`, `phone?`, `isDefault?`
- `OrderItem`: `id`, `productId`, `variantId`, `title`, `variantTitle?`, `price`, `quantity`, `imageUrl?`, `selectedOptions?`
- `OrderStatus`: `'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`
- `PaymentStatus`: `'paid' | 'pending' | 'refunded'`
- `OrderShippingInfo`: `name`, `price`, `trackingNumber?`, `trackingUrl?`
- `Order`: `id`, `orderNumber`, `storeId`, `createdAt`, `items`, `subtotal`, `shipping`, `tax`, `discount`, `total`, `currency`, `status`, `paymentStatus`, `shippingAddress`, `billingAddress?`, `shippingMethod`
- `UserProfile`: `id`, `email`, `firstName`, `lastName`, `phone?`, `avatarUrl?`, `savedAddresses`, `orderHistory`, `wishlistProductIds`

### 1.4 Storage Engine Capabilities in `src/utils/storage.ts`
- Provides `getStorageItem<T>(storeId, key, defaultValue)`, `setStorageItem<T>(storeId, key, value)`, `removeStorageItem(storeId, key)`, `clearStoreStorage(storeId)`, and `subscribeToStorage<T>(storeId, key, callback)`.
- Key format: `shopify_portfolio:${storeId}:${key}`.
- Dispatches both native `storage` events (cross-tab) and custom `shopify_portfolio:storage_change` events (same-window).
- Seamless memory fallback `MemoryStorage` in case of quota exhaustion or SSR.

### 1.5 Account Test Invariants in `tests/`
- `tests/e2e/tier1_features/t1_11_demo_account.test.ts`:
  - Profile details without real auth (`name`, `email`, `addresses`).
  - Placed orders are recorded in simulated order history with matching `orderId`, `items`, `total`, and confirmed status.
  - Saved addresses maintain an `isDefault` flag.
- `tests/e2e/tier2_boundaries/t2_09_account_data_boundaries.test.ts`:
  - Empty order history (0 orders) renders gracefully.
  - Large volumes (120+ orders) handled safely without memory crash.
  - Empty address list (0 addresses) handled gracefully.
  - 500-character long street names handled safely without truncation or crash.
  - Adding/setting an address with `isDefault: true` must reset `isDefault: false` on all prior addresses (single-default invariant).
  - Deleting the only address leaves an empty array without runtime error.
- `tests/e2e/tier3_interactions/t3_09_full_checkout_order_history_interaction.test.ts`:
  - Completing checkout clears cart and records completed `Order` into account history.

---

## 2. Logic Chain

1. **Premise**: `npm run build` fails because `tsc` encounters TS6133 in `Drawer.test.tsx` and `Modal.test.tsx`.
   **Inference**: Removing the unused `React` default import from line 2 of both files leaves only the necessary named imports (`{ act, useState }`), immediately resolving TS6133 without altering test runtime semantics. Because no other compiler errors exist in the codebase, `npx tsc --noEmit` and `npm run build` will pass cleanly with exit code 0.
2. **Premise**: R1 and PROJECT.md mandate an `AccountContext` providing demo user profile, saved addresses, order history, demo mode notices, and persistence across refreshes.
   **Inference**:
   - Customer profile and addresses are account-level assets that apply globally across all demo stores. Persisting them with `storeId = 'global'` in `src/utils/storage.ts` allows a user to carry their saved address book and profile when browsing between Coffee, Fashion, Jewelry, and Electronics.
   - Order history contains orders with a `storeId` field. Storing orders under `global:account_orders` while providing both a master order list and a `getOrdersByStore(storeId)` helper ensures that store-specific order filtering works while multi-store shopper scenarios remain consistent.
3. **Premise**: Test `t2_09` explicitly enforces that only one address can have `isDefault: true` at any time, and setting a new default resets previous defaults.
   **Inference**: `addAddress`, `updateAddress`, and `setDefaultAddress` in `AccountContext` must implement atomic mapping logic that resets all other addresses to `isDefault: false` whenever an address is marked as default.
4. **Premise**: Downstream providers have explicit dependencies:
   - `ThemeProvider` needs the active store theme tokens.
   - `CartProvider` needs the active store ID, shipping threshold, and tax rate.
   - `WishlistProvider` needs `storeId` and `CartContext.addItem` for `moveToCart`.
   - `SearchProvider` needs the store catalog and `storeId`.
   - `CheckoutProvider` needs `CartContext` (for items/totals/clearCart), `AccountContext` (for default shipping address, customer email, and recording the completed order via `recordOrder`), and `StoreContext` (for `storeId` and `currency`).
   **Inference**:
   The unique, valid provider composition tree in `src/engine/index.ts` must order providers from outermost to innermost:
   `StoreProvider` → `ThemeProvider` → `AccountProvider` → `CartProvider` → `WishlistProvider` → `SearchProvider` → `CheckoutProvider` → `{children}`.

---

## 3. Caveats

1. **Store Switching Persistence**: Orders recorded from one store (e.g. coffee) remain in order history when switching stores. This is intentional and aligned with test scenario `t3_09` and `t4_05` where customer identity spans across stores.
2. **Simulated Auth Scope**: In accordance with the prompt ("no real authentication"), `isAuthenticated` defaults to `true` for seamless portfolio exploration, but exposes `login()` and `logout()` to allow testing authenticated vs guest UI views if desired.
3. **Parallel Explorer Synchronization**: `explorer_m2_1` is designing `CartContext`, `WishlistContext`, and `CheckoutContext`; `explorer_m2_2` is designing `ThemeContext`, `SearchContext`, and `StoreContext`. The interface names and signatures referenced in this report match the exact contracts established across all dispatches and `PROJECT.md`.

---

## 4. Conclusion & Actionable Blueprints

### 4.1 Exact Instructions to Fix TS6133 Compiler Errors
The Worker must execute these two localized edits:

#### Edit 1: `src/components/common/__tests__/Drawer.test.tsx`
- **Location**: Line 2
- **Target content**:
  ```tsx
  import React, { act, useState } from 'react';
  ```
- **Replacement content**:
  ```tsx
  import { act, useState } from 'react';
  ```

#### Edit 2: `src/components/common/__tests__/Modal.test.tsx`
- **Location**: Line 2
- **Target content**:
  ```tsx
  import React, { act, useState } from 'react';
  ```
- **Replacement content**:
  ```tsx
  import { act, useState } from 'react';
  ```

---

### 4.2 Complete Implementation Blueprint: `src/engine/AccountContext.tsx`

The Worker should create `src/engine/AccountContext.tsx` with zero `any` types:

```tsx
/**
 * AccountContext - Simulated Customer Profile, Address Book & Order History
 * Fully aligned with PROJECT.md and tests/e2e/tier1_features/t1_11_demo_account.test.ts
 *
 * Implements:
 * - Demo UserProfile with name, email, avatar, and phone
 * - Saved Address management with single-default invariant
 * - Simulated Order history tracking with cross-store support
 * - Demo mode notice state and persistence via src/utils/storage.ts
 * - Zero `any` types
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Address, Order, UserProfile } from '../types/order';
import { getStorageItem, setStorageItem, subscribeToStorage } from '../utils/storage';

// Storage keys in the 'global' namespace
const STORAGE_STORE_ID = 'global';
const STORAGE_KEY_PROFILE = 'account_profile';
const STORAGE_KEY_ADDRESSES = 'account_addresses';
const STORAGE_KEY_ORDERS = 'account_orders';
const STORAGE_KEY_NOTICE = 'account_notice_dismissed';

export const INITIAL_DEMO_ADDRESSES: Address[] = [
  {
    id: 'addr_demo_1',
    firstName: 'Alex',
    lastName: 'Morgan',
    company: 'Studio Arc',
    addressLine1: '742 Evergreen Terrace',
    addressLine2: 'Suite 200',
    city: 'Springfield',
    stateOrProvince: 'OR',
    postalCode: '97477',
    country: 'United States',
    phone: '+1 (555) 234-5678',
    isDefault: true,
  },
  {
    id: 'addr_demo_2',
    firstName: 'Alex',
    lastName: 'Morgan',
    company: 'Tech Hub Works',
    addressLine1: '100 Tech Blvd',
    addressLine2: 'Floor 4',
    city: 'Seattle',
    stateOrProvince: 'WA',
    postalCode: '98104',
    country: 'United States',
    phone: '+1 (555) 876-5432',
    isDefault: false,
  },
];

export const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'DEMO-ORD-1001',
    orderNumber: '#1001',
    storeId: 'coffee',
    createdAt: '2026-09-28T14:32:00Z',
    items: [
      {
        id: 'coffee-ethiopia-yirgacheffe-250g-whole',
        productId: 'coffee-ethiopia-yirgacheffe',
        variantId: 'var-ey-250-wb',
        title: 'Ethiopia Yirgacheffe Single Origin',
        variantTitle: '250g / Whole Bean',
        price: 22.00,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        selectedOptions: { Grind: 'Whole Bean', Weight: '250g' },
      },
    ],
    subtotal: 44.00,
    shipping: 0.00,
    tax: 3.52,
    discount: 0.00,
    total: 47.52,
    currency: 'USD',
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: INITIAL_DEMO_ADDRESSES[0],
    shippingMethod: {
      name: 'Complimentary Roaster Delivery',
      price: 0.00,
      trackingNumber: 'TRK-CF-8891023',
      trackingUrl: '#',
    },
  },
  {
    id: 'DEMO-ORD-1002',
    orderNumber: '#1002',
    storeId: 'fashion',
    createdAt: '2026-10-02T09:15:00Z',
    items: [
      {
        id: 'fashion-oversized-wool-blazer-m-noir',
        productId: 'fashion-oversized-wool-blazer',
        variantId: 'var-blazer-m-noir',
        title: 'Structured Virgin Wool Blazer',
        variantTitle: 'Medium / Noir',
        price: 280.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
        selectedOptions: { Size: 'M', Color: 'Noir' },
      },
    ],
    subtotal: 280.00,
    shipping: 15.00,
    tax: 23.60,
    discount: 0.00,
    total: 318.60,
    currency: 'USD',
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: INITIAL_DEMO_ADDRESSES[0],
    shippingMethod: {
      name: 'Express Courier Air',
      price: 15.00,
      trackingNumber: 'TRK-AT-9912044',
      trackingUrl: '#',
    },
  },
];

export const INITIAL_DEMO_PROFILE: UserProfile = {
  id: 'usr_demo_001',
  email: 'alex.morgan@portfolio.demo',
  firstName: 'Alex',
  lastName: 'Morgan',
  phone: '+1 (555) 234-5678',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  savedAddresses: INITIAL_DEMO_ADDRESSES,
  orderHistory: INITIAL_DEMO_ORDERS,
  wishlistProductIds: [],
};

export interface AccountContextValue {
  // Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'savedAddresses' | 'orderHistory' | 'wishlistProductIds'>>) => void;
  resetDemoAccount: () => void;

  // Addresses
  addresses: Address[];
  defaultAddress: Address | undefined;
  addAddress: (address: Omit<Address, 'id'>) => string;
  updateAddress: (id: string, updates: Partial<Omit<Address, 'id'>>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Orders
  orders: Order[];
  recordOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStore: (storeId: string) => Order[];

  // Demo Notices & Simulation
  isDemoMode: boolean;
  demoNoticeText: string;
  isSimulatedNoticeDismissed: boolean;
  dismissSimulatedNotice: () => void;

  // Auth Simulation
  isAuthenticated: boolean;
  login: (email?: string) => void;
  logout: () => void;
}

export const AccountContext = createContext<AccountContextValue | null>(null);

export interface AccountProviderProps {
  children: React.ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(() =>
    getStorageItem<UserProfile>(STORAGE_STORE_ID, STORAGE_KEY_PROFILE, INITIAL_DEMO_PROFILE)
  );

  const [addresses, setAddressesState] = useState<Address[]>(() =>
    getStorageItem<Address[]>(STORAGE_STORE_ID, STORAGE_KEY_ADDRESSES, INITIAL_DEMO_ADDRESSES)
  );

  const [orders, setOrdersState] = useState<Order[]>(() =>
    getStorageItem<Order[]>(STORAGE_STORE_ID, STORAGE_KEY_ORDERS, INITIAL_DEMO_ORDERS)
  );

  const [isSimulatedNoticeDismissed, setIsSimulatedNoticeDismissed] = useState<boolean>(() =>
    getStorageItem<boolean>(STORAGE_STORE_ID, STORAGE_KEY_NOTICE, false)
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Sync to storage on state changes
  const setProfile = useCallback((newProfile: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfileState((prev) => {
      const updated = typeof newProfile === 'function' ? newProfile(prev) : newProfile;
      setStorageItem(STORAGE_STORE_ID, STORAGE_KEY_PROFILE, updated);
      return updated;
    });
  }, []);

  const setAddresses = useCallback((newAddresses: Address[] | ((prev: Address[]) => Address[])) => {
    setAddressesState((prev) => {
      const updated = typeof newAddresses === 'function' ? newAddresses(prev) : newAddresses;
      setStorageItem(STORAGE_STORE_ID, STORAGE_KEY_ADDRESSES, updated);
      return updated;
    });
  }, []);

  const setOrders = useCallback((newOrders: Order[] | ((prev: Order[]) => Order[])) => {
    setOrdersState((prev) => {
      const updated = typeof newOrders === 'function' ? newOrders(prev) : newOrders;
      setStorageItem(STORAGE_STORE_ID, STORAGE_KEY_ORDERS, updated);
      return updated;
    });
  }, []);

  // Multi-tab storage sync
  useEffect(() => {
    const unsubProfile = subscribeToStorage<UserProfile>(STORAGE_STORE_ID, STORAGE_KEY_PROFILE, (val) => {
      if (val) setProfileState(val);
    });
    const unsubAddresses = subscribeToStorage<Address[]>(STORAGE_STORE_ID, STORAGE_KEY_ADDRESSES, (val) => {
      if (val) setAddressesState(val);
    });
    const unsubOrders = subscribeToStorage<Order[]>(STORAGE_STORE_ID, STORAGE_KEY_ORDERS, (val) => {
      if (val) setOrdersState(val);
    });
    const unsubNotice = subscribeToStorage<boolean>(STORAGE_STORE_ID, STORAGE_KEY_NOTICE, (val) => {
      if (typeof val === 'boolean') setIsSimulatedNoticeDismissed(val);
    });

    return () => {
      unsubProfile();
      unsubAddresses();
      unsubOrders();
      unsubNotice();
    };
  }, []);

  // Profile operations
  const updateProfile = useCallback(
    (updates: Partial<Omit<UserProfile, 'id' | 'savedAddresses' | 'orderHistory' | 'wishlistProductIds'>>) => {
      setProfile((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [setProfile]
  );

  // Address operations with single-default invariant
  const addAddress = useCallback(
    (addressData: Omit<Address, 'id'>): string => {
      const newId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setAddresses((prev) => {
        const isFirst = prev.length === 0;
        const willBeDefault = Boolean(addressData.isDefault || isFirst);

        const newAddress: Address = {
          ...addressData,
          id: newId,
          isDefault: willBeDefault,
        };

        if (willBeDefault) {
          return [...prev.map((a) => ({ ...a, isDefault: false })), newAddress];
        }
        return [...prev, newAddress];
      });
      return newId;
    },
    [setAddresses]
  );

  const updateAddress = useCallback(
    (id: string, updates: Partial<Omit<Address, 'id'>>) => {
      setAddresses((prev) => {
        const target = prev.find((a) => a.id === id);
        if (!target) return prev;

        const isBecomingDefault = updates.isDefault === true;
        return prev.map((addr) => {
          if (addr.id === id) {
            return { ...addr, ...updates };
          }
          if (isBecomingDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        });
      });
    },
    [setAddresses]
  );

  const removeAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        const remaining = prev.filter((a) => a.id !== id);
        // If we removed the default address and other addresses exist, make the first one default
        const removedWasDefault = prev.find((a) => a.id === id)?.isDefault;
        if (removedWasDefault && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });
    },
    [setAddresses]
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
    },
    [setAddresses]
  );

  const defaultAddress = useMemo(() => {
    return addresses.find((a) => a.isDefault) || addresses[0];
  }, [addresses]);

  // Order operations
  const recordOrder = useCallback(
    (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    },
    [setOrders]
  );

  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    },
    [orders]
  );

  const getOrdersByStore = useCallback(
    (storeId: string): Order[] => {
      return orders.filter((o) => o.storeId === storeId);
    },
    [orders]
  );

  // Demo mode notices & actions
  const dismissSimulatedNotice = useCallback(() => {
    setIsSimulatedNoticeDismissed(true);
    setStorageItem(STORAGE_STORE_ID, STORAGE_KEY_NOTICE, true);
  }, []);

  const resetDemoAccount = useCallback(() => {
    setProfile(INITIAL_DEMO_PROFILE);
    setAddresses(INITIAL_DEMO_ADDRESSES);
    setOrders(INITIAL_DEMO_ORDERS);
    setIsSimulatedNoticeDismissed(false);
    setStorageItem(STORAGE_STORE_ID, STORAGE_KEY_NOTICE, false);
    setIsAuthenticated(true);
  }, [setProfile, setAddresses, setOrders]);

  const login = useCallback((email?: string) => {
    setIsAuthenticated(true);
    if (email) {
      setProfile((prev) => ({ ...prev, email }));
    }
  }, [setProfile]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      profile,
      updateProfile,
      resetDemoAccount,
      addresses,
      defaultAddress,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      orders,
      recordOrder,
      getOrderById,
      getOrdersByStore,
      isDemoMode: true,
      demoNoticeText:
        'Demo Mode Active: All profile details, saved addresses, and orders are stored locally in your browser and will not create real transactions.',
      isSimulatedNoticeDismissed,
      dismissSimulatedNotice,
      isAuthenticated,
      login,
      logout,
    }),
    [
      profile,
      updateProfile,
      resetDemoAccount,
      addresses,
      defaultAddress,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      orders,
      recordOrder,
      getOrderById,
      getOrdersByStore,
      isSimulatedNoticeDismissed,
      dismissSimulatedNotice,
      isAuthenticated,
      login,
      logout,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = (): AccountContextValue => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
```

---

### 4.3 Complete Implementation Blueprint: `src/engine/index.ts` (Provider Composition Root)

The Worker should create `src/engine/index.ts` to export all engine contexts, hooks, and compose them into `ShopifyEngineProvider`:

```tsx
/**
 * Unified Shopify Engine Composition Root & Central Barrel
 * Composes all 7 React context providers in exact dependency order:
 *
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

// Barrel re-exports of providers, contexts, and hooks
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

export interface ShopifyEngineProviderProps {
  children: React.ReactNode;
  initialStoreId?: string; // e.g. 'coffee' | 'fashion' | 'jewelry' | 'electronics'
}

/**
 * Unified E-Commerce Engine Provider
 * Wraps any tree with all necessary domain state and behavioral state machines.
 */
export const ShopifyEngineProvider: React.FC<ShopifyEngineProviderProps> = ({
  children,
  initialStoreId = 'coffee',
}) => {
  return (
    <StoreProvider initialStoreId={initialStoreId}>
      <ThemeProvider>
        <AccountProvider>
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <CheckoutProvider>
                  {children}
                </CheckoutProvider>
              </SearchProvider>
            </WishlistProvider>
          </CartProvider>
        </AccountProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default ShopifyEngineProvider;
```

---

### 4.4 Unit Test Specification: `src/engine/__tests__/AccountContext.test.tsx`

The Worker should create `src/engine/__tests__/AccountContext.test.tsx` verifying all core and boundary behaviors under Vitest:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AccountProvider, useAccount } from '../AccountContext';
import { clearStoreStorage } from '../../utils/storage';
import { Order } from '../../types/order';

describe('AccountContext - Unit & Boundary Verification', () => {
  beforeEach(() => {
    clearStoreStorage('global');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AccountProvider>{children}</AccountProvider>
  );

  it('initializes with default demo profile, addresses, and orders', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    expect(result.current.profile.name || `${result.current.profile.firstName} ${result.current.profile.lastName}`).toContain('Alex Morgan');
    expect(result.current.addresses.length).toBeGreaterThanOrEqual(1);
    expect(result.current.orders.length).toBeGreaterThanOrEqual(1);
    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.defaultAddress).toBeDefined();
  });

  it('updates profile fields without modifying id or addresses', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    act(() => {
      result.current.updateProfile({ firstName: 'Taylor', email: 'taylor@demo.test' });
    });
    expect(result.current.profile.firstName).toBe('Taylor');
    expect(result.current.profile.email).toBe('taylor@demo.test');
  });

  it('adds an address and auto-assigns an ID', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    let newId = '';
    act(() => {
      newId = result.current.addAddress({
        firstName: 'Sam',
        lastName: 'Taylor',
        addressLine1: '500 Innovation Way',
        city: 'San Francisco',
        stateOrProvince: 'CA',
        postalCode: '94105',
        country: 'United States',
        isDefault: false,
      });
    });
    expect(newId).toBeTruthy();
    expect(result.current.addresses.some((a) => a.id === newId)).toBe(true);
  });

  it('maintains single-default invariant when adding or setting a new default address', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    let newId = '';
    act(() => {
      newId = result.current.addAddress({
        firstName: 'Default',
        lastName: 'User',
        addressLine1: '999 Priority Ln',
        city: 'Austin',
        stateOrProvince: 'TX',
        postalCode: '78701',
        country: 'United States',
        isDefault: true,
      });
    });

    const defaults = result.current.addresses.filter((a) => a.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].id).toBe(newId);
    expect(result.current.defaultAddress?.id).toBe(newId);
  });

  it('handles 500-character long street names safely (boundary check)', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    const longStreet = 'X'.repeat(500);
    let newId = '';
    act(() => {
      newId = result.current.addAddress({
        firstName: 'Boundary',
        lastName: 'Tester',
        addressLine1: longStreet,
        city: 'Metropolis',
        stateOrProvince: 'NY',
        postalCode: '10001',
        country: 'United States',
      });
    });
    const addr = result.current.addresses.find((a) => a.id === newId);
    expect(addr?.addressLine1).toHaveLength(500);
  });

  it('removing default address assigns a remaining address as default', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    const initialDefaultId = result.current.defaultAddress?.id;
    expect(initialDefaultId).toBeDefined();

    act(() => {
      result.current.removeAddress(initialDefaultId!);
    });

    if (result.current.addresses.length > 0) {
      expect(result.current.defaultAddress).toBeDefined();
      expect(result.current.defaultAddress?.id).not.toBe(initialDefaultId);
    }
  });

  it('records new order into history at index 0', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    const newOrder: Order = {
      id: 'DEMO-ORD-TEST-999',
      orderNumber: '#999',
      storeId: 'electronics',
      createdAt: new Date().toISOString(),
      items: [],
      subtotal: 199.99,
      shipping: 0,
      tax: 16.00,
      discount: 0,
      total: 215.99,
      currency: 'USD',
      status: 'processing',
      paymentStatus: 'paid',
      shippingAddress: result.current.addresses[0],
      shippingMethod: { name: 'Ground', price: 0 },
    };

    act(() => {
      result.current.recordOrder(newOrder);
    });

    expect(result.current.orders[0].id).toBe('DEMO-ORD-TEST-999');
    expect(result.current.getOrderById('DEMO-ORD-TEST-999')).toBeDefined();
  });

  it('filters orders by store ID via getOrdersByStore', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    const coffeeOrders = result.current.getOrdersByStore('coffee');
    expect(coffeeOrders.every((o) => o.storeId === 'coffee')).toBe(true);
  });

  it('handles 120+ orders in order history without crash (boundary check)', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    act(() => {
      for (let i = 0; i < 125; i++) {
        result.current.recordOrder({
          id: `ORD-BULK-${i}`,
          orderNumber: `#BULK-${i}`,
          storeId: 'coffee',
          createdAt: new Date().toISOString(),
          items: [],
          subtotal: 10 + i,
          shipping: 0,
          tax: 1,
          discount: 0,
          total: 11 + i,
          currency: 'USD',
          status: 'delivered',
          paymentStatus: 'paid',
          shippingAddress: result.current.addresses[0],
          shippingMethod: { name: 'Standard', price: 0 },
        });
      }
    });
    expect(result.current.orders.length).toBeGreaterThanOrEqual(125);
    expect(result.current.orders[0].id).toBe('ORD-BULK-124');
  });

  it('allows dismissing demo notice and toggles state', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    act(() => {
      result.current.dismissSimulatedNotice();
    });
    expect(result.current.isSimulatedNoticeDismissed).toBe(true);
  });

  it('resets demo account back to initial state', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });
    act(() => {
      result.current.updateProfile({ firstName: 'Changed' });
      result.current.resetDemoAccount();
    });
    expect(result.current.profile.firstName).toBe('Alex');
  });
});
```

---

## 5. Verification Method

To independently verify all findings and validate the implementation:

1. **Verify TS6133 Fix and Clean Build**:
   ```bash
   # In project root: C:\Users\Arham\.gemini\antigravity\scratch\shopify_portfolio
   npx tsc --noEmit
   npm run build
   ```
   **Expected Outcome**: Both commands complete with **exit code 0** and zero compiler diagnostics.
   **Invalidation condition**: Any output containing `error TS...`.

2. **Verify E2E Test Suite Integrity**:
   ```bash
   npm run test:e2e
   ```
   **Expected Outcome**: All **188/188 tests pass** across Tiers 1-4 with exit code 0.
   **Invalidation condition**: Any failed test or facade assertion.

3. **Verify Vitest Unit Test Suite**:
   ```bash
   npm test
   ```
   **Expected Outcome**: All existing unit tests pass, plus the new `AccountContext.test.tsx` suite passes cleanly with exit code 0.

4. **Verify TypeScript Strictness & Zero `any` Types**:
   Inspect newly added files in `src/engine/` to verify absence of `any` types and proper generic typing on all Context values and hooks.
