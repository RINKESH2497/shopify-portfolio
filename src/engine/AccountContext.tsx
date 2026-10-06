/**
 * AccountContext - Simulated Customer Profile, Address Book & Order History
 *
 * Implements:
 * - Demo UserProfile with name, email, avatar, and phone
 * - Saved Address management with strict single-default invariant
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
        price: 22.0,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        selectedOptions: { Grind: 'Whole Bean', Weight: '250g' },
      },
    ],
    subtotal: 44.0,
    shipping: 0.0,
    tax: 3.52,
    discount: 0.0,
    total: 47.52,
    currency: 'USD',
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: INITIAL_DEMO_ADDRESSES[0],
    shippingMethod: {
      name: 'Complimentary Roaster Delivery',
      price: 0.0,
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
        price: 280.0,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
        selectedOptions: { Size: 'M', Color: 'Noir' },
      },
    ],
    subtotal: 280.0,
    shipping: 15.0,
    tax: 23.6,
    discount: 0.0,
    total: 318.6,
    currency: 'USD',
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: INITIAL_DEMO_ADDRESSES[0],
    shippingMethod: {
      name: 'Express Courier Air',
      price: 15.0,
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
  children?: React.ReactNode;
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
