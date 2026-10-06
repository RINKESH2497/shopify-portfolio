/**
 * Cart & Checkout Type Definitions
 * Exact alignment with PROJECT.md lines 145-173.
 * Zero `any` — models line items, financial totals, 4-step checkout states, and shipping tiers.
 */

import { Product } from './product';

export interface CartItem {
  id: string; // unique item line id: `${productId}-${variantId}`
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedOptions: Record<string, string>;
}

export type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation';

export interface ShippingMethod {
  id: string;
  name: string; // e.g. "Standard Delivery", "Express Courier"
  price: number; // 0 for free shipping
  estimatedDelivery: string; // e.g. "3-5 business days"
  description?: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  saveInformation?: boolean;
}

export interface PaymentDetails {
  method: 'card' | 'apple-pay' | 'google-pay' | 'demo';
  cardNumberMasked?: string;
  expiryDate?: string;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  formData: CheckoutFormData;
  shippingMethod?: ShippingMethod;
  paymentDetails?: PaymentDetails;
  isSubmitting: boolean;
  error?: string | null;
  completedOrderId?: string | null;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, variantId?: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingProgress: number; // 0 to 100
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedDiscountCode?: string | null;
  discountAmount?: number;
  applyDiscount?: (code: string) => boolean;
  removeDiscount?: () => void;
}
