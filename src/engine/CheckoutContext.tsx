/**
 * CheckoutContext - Simulated 4-Step Checkout Engine & State Machine
 *
 * Implements:
 * - 4-step state machine: information -> shipping -> payment -> confirmation
 * - Strict step-skipping guards and input validations
 * - Realistic order creation with DEMO-ORD-* identifiers conforming to Order type
 * - Integration with CartContext (cart clear) and AccountContext (order history)
 * - Zero `any` types
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { CheckoutStep } from '../types/cart';
import { Order } from '../types/order';
import { createStoreStorage } from '../utils/storage';
import { CartContext } from './CartContext';
import { StoreContext } from './StoreContext';
import { AccountContext } from './AccountContext';

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ShippingMethodSelection {
  id: 'standard' | 'express' | 'free';
  name: string;
  rate: number;
  estimatedDelivery?: string;
}

export interface PaymentSubmission {
  cardNumber: string;
  expiry: string;
  cvc: string;
  isDemo: boolean;
  billingSameAsShipping?: boolean;
}

export interface CheckoutContextValue {
  step: CheckoutStep;
  currentStep: CheckoutStep; // Test-compatible alias
  customerInfo: CustomerInfo | null;
  shippingMethod: ShippingMethodSelection | null;
  paymentDetails: PaymentSubmission | null;
  completedOrder: Order | null;
  availableShippingMethods: ShippingMethodSelection[];
  setCustomerInfo: (info: CustomerInfo) => void;
  setShippingMethod: (method: ShippingMethodSelection) => void;
  processPayment: (payment: PaymentSubmission) => Order;
  goToStep: (targetStep: CheckoutStep) => void;
  resetCheckout: () => void;
  error: string | null;
  setError: (err: string | null) => void;
  isDemoBannerVisible: boolean;
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export interface CheckoutProviderProps {
  children?: React.ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const storeContext = useContext(StoreContext);
  const cartContext = useContext(CartContext);
  const accountContext = useContext(AccountContext);

  const resolvedStoreId = storeContext?.storeId || 'global';
  const resolvedStoreConfig = storeContext?.storeConfig;

  const [step, setStep] = useState<CheckoutStep>('information');
  const [customerInfo, setCustomerInfoState] = useState<CustomerInfo | null>(null);
  const [shippingMethod, setShippingMethodState] = useState<ShippingMethodSelection | null>(null);
  const [paymentDetails, setPaymentDetailsState] = useState<PaymentSubmission | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived available shipping methods based on active cart totals
  const availableShippingMethods = useMemo<ShippingMethodSelection[]>(() => {
    const subtotal = cartContext?.subtotal ?? 0;
    const threshold = cartContext?.freeShippingThreshold ?? resolvedStoreConfig?.freeShippingThreshold ?? 50.0;
    const standardRate = resolvedStoreConfig?.standardShippingRate ?? 5.0;

    const qualifiesForFree = (threshold === 0 && subtotal > 0) || (subtotal >= threshold && subtotal > 0);

    const methods: ShippingMethodSelection[] = [];

    if (qualifiesForFree) {
      methods.push({
        id: 'free',
        name: 'Complimentary Free Shipping',
        rate: 0.0,
        estimatedDelivery: '3-5 business days',
      });
    } else {
      methods.push({
        id: 'standard',
        name: 'Standard Ground Shipping',
        rate: standardRate,
        estimatedDelivery: '3-5 business days',
      });
    }

    methods.push({
      id: 'express',
      name: 'Express Courier Air',
      rate: 15.0,
      estimatedDelivery: '1-2 business days',
    });

    return methods;
  }, [cartContext?.subtotal, cartContext?.freeShippingThreshold, resolvedStoreConfig]);

  // Step 1: Set & validate Customer Info
  const setCustomerInfo = useCallback((info: CustomerInfo) => {
    if (!info.email || !info.email.includes('@')) {
      const msg = 'Invalid email address';
      setError(msg);
      throw new Error(msg);
    }
    if (!info.firstName.trim() || !info.lastName.trim()) {
      const msg = 'First and last name are required';
      setError(msg);
      throw new Error(msg);
    }
    if (!info.address.trim() || !info.city.trim() || !info.postalCode.trim()) {
      const msg = 'Complete shipping address required';
      setError(msg);
      throw new Error(msg);
    }

    setCustomerInfoState(info);
    setError(null);
    setStep('shipping');
  }, []);

  // Step 2: Set Shipping Method with step guard
  const setShippingMethod = useCallback(
    (method: ShippingMethodSelection) => {
      if (step !== 'shipping' && !customerInfo) {
        const msg = 'Cannot set shipping before information step';
        setError(msg);
        throw new Error(msg);
      }

      setShippingMethodState(method);
      setError(null);
      setStep('payment');
    },
    [step, customerInfo]
  );

  // Step 3: Process Payment with strict demo guard and order creation
  const processPayment = useCallback(
    (payment: PaymentSubmission): Order => {
      if (step !== 'payment' && !shippingMethod) {
        const msg = 'Cannot process payment before shipping step';
        setError(msg);
        throw new Error(msg);
      }

      const rawDigits = payment.cardNumber ? payment.cardNumber.replace(/\s/g, '') : '';
      if (!payment.cardNumber || rawDigits.length < 13) {
        const msg = 'Valid credit card number required';
        setError(msg);
        throw new Error(msg);
      }

      if (!payment.isDemo) {
        const msg = 'Demo transaction confirmation required';
        setError(msg);
        throw new Error(msg);
      }

      setPaymentDetailsState(payment);

      const items = cartContext?.items ?? [];
      const subtotal = cartContext?.subtotal ?? 0;
      const tax = cartContext?.tax ?? 0;
      const discount = cartContext?.discountAmount ?? 0;
      const shippingFee = shippingMethod?.rate ?? 0;
      const total = Math.round((subtotal + shippingFee + tax - discount) * 100) / 100;

      const orderId = `DEMO-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

      const order: Order = {
        id: orderId,
        orderNumber,
        storeId: resolvedStoreId,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          title: i.title,
          variantTitle: i.variantTitle,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
          selectedOptions: i.selectedOptions,
        })),
        subtotal,
        shipping: shippingFee,
        tax,
        discount,
        total,
        currency: resolvedStoreConfig?.currency ?? 'USD',
        status: 'processing',
        paymentStatus: 'paid',
        shippingAddress: {
          id: `addr-${Date.now()}`,
          firstName: customerInfo?.firstName || 'Guest',
          lastName: customerInfo?.lastName || 'Shopper',
          addressLine1: customerInfo?.address || '123 Main St',
          addressLine2: customerInfo?.apartment,
          city: customerInfo?.city || 'Springfield',
          stateOrProvince: customerInfo?.state || 'OR',
          postalCode: customerInfo?.postalCode || '97477',
          country: customerInfo?.country || 'United States',
          phone: customerInfo?.phone,
        },
        shippingMethod: {
          name: shippingMethod?.name || 'Standard Shipping',
          price: shippingFee,
          trackingNumber: `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        },
      };

      // 1. Record completed order into state
      setCompletedOrder(order);

      // 2. Persist order into AccountContext and namespaced store storage
      if (accountContext) {
        accountContext.recordOrder(order);
      }
      const storage = createStoreStorage(resolvedStoreId);
      const existingStoreOrders = storage.get<Order[]>('order_history', []);
      storage.set('order_history', [order, ...existingStoreOrders]);

      // 3. Clear the active cart
      if (cartContext) {
        cartContext.clearCart();
      }

      // 4. Transition to confirmation step
      setStep('confirmation');
      setError(null);

      return order;
    },
    [step, shippingMethod, customerInfo, cartContext, resolvedStoreId, resolvedStoreConfig, accountContext]
  );

  // Safe navigation between steps
  const goToStep = useCallback(
    (targetStep: CheckoutStep) => {
      if (targetStep === 'information') {
        setStep('information');
      } else if (targetStep === 'shipping') {
        if (!customerInfo) {
          throw new Error('Customer information required to navigate to shipping');
        }
        setStep('shipping');
      } else if (targetStep === 'payment') {
        if (!customerInfo || !shippingMethod) {
          throw new Error('Shipping method required to navigate to payment');
        }
        setStep('payment');
      } else if (targetStep === 'confirmation') {
        if (!completedOrder) {
          throw new Error('Payment completion required to view confirmation');
        }
        setStep('confirmation');
      }
    },
    [customerInfo, shippingMethod, completedOrder]
  );

  const resetCheckout = useCallback(() => {
    setStep('information');
    setCustomerInfoState(null);
    setShippingMethodState(null);
    setPaymentDetailsState(null);
    setCompletedOrder(null);
    setError(null);
  }, []);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      step,
      currentStep: step,
      customerInfo,
      shippingMethod,
      paymentDetails,
      completedOrder,
      availableShippingMethods,
      setCustomerInfo,
      setShippingMethod,
      processPayment,
      goToStep,
      resetCheckout,
      error,
      setError,
      isDemoBannerVisible: true,
    }),
    [
      step,
      customerInfo,
      shippingMethod,
      paymentDetails,
      completedOrder,
      availableShippingMethods,
      setCustomerInfo,
      setShippingMethod,
      processPayment,
      goToStep,
      resetCheckout,
      error,
    ]
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
};

export const useCheckout = (): CheckoutContextValue => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
