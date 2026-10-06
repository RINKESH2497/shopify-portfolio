/**
 * Order, Address & User Profile Type Definitions
 * Models simulated customer profile, order history, and address books.
 * Zero `any` — full support for Demo Account UI state and Checkout order creation.
 */

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedOptions?: Record<string, string>;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface OrderShippingInfo {
  name: string;
  price: number;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface Order {
  id: string; // e.g. "ORD-84920"
  orderNumber: string; // e.g. "#1001"
  storeId: string; // e.g. "coffee", "fashion", "jewelry", "electronics"
  createdAt: string; // ISO 8601 date string e.g. "2026-10-05T10:00:00Z"
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: OrderShippingInfo;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  savedAddresses: Address[];
  orderHistory: Order[];
  wishlistProductIds: string[];
}
