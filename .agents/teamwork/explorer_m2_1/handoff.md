# Technical Blueprint & Handoff Report: CartContext, WishlistContext & Simulated 4-Step Checkout Flow

**Agent**: `explorer_m2_1` (Teamwork Explorer)  
**Target Milestone**: Milestone 2 — E-Commerce Engine State  
**Scope**: `src/engine/CartContext.tsx`, `src/engine/WishlistContext.tsx`, `src/engine/CheckoutContext.tsx` (and `src/engine/checkout.ts`)  
**Status**: Ready for Worker Implementation  

---

## 1. Observation

Direct observations from examining the codebase, contracts, test suites, and reference engine:

### 1.1 Existing Type Contracts in `src/types/`
- **`src/types/cart.ts` (lines 9-80)**:
  - `CartItem`:
    ```typescript
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
    ```
  - `CheckoutStep`: `'information' | 'shipping' | 'payment' | 'confirmation'`
  - `ShippingMethod`: `{ id: string; name: string; price: number; estimatedDelivery: string; description?: string }`
  - `CheckoutFormData`: `{ email: string; firstName: string; lastName: string; address: string; apartment?: string; city: string; state: string; postalCode: string; country: string; phone?: string; saveInformation?: boolean }`
  - `PaymentDetails`: `{ method: 'card' | 'apple-pay' | 'google-pay' | 'demo'; cardNumberMasked?: string; expiryDate?: string }`
  - `CheckoutState`: `{ currentStep: CheckoutStep; formData: CheckoutFormData; shippingMethod?: ShippingMethod; paymentDetails?: PaymentDetails; isSubmitting: boolean; error?: string | null; completedOrderId?: string | null }`
  - `CartContextValue`: Defines `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalQuantity`, `subtotal`, `shipping`, `total`, `freeShippingThreshold`, `freeShippingProgress`, `isCartOpen`, `setIsCartOpen`, optional discount helpers.

- **`src/types/order.ts` (lines 44-73)**:
  - `Order`: `{ id: string; orderNumber: string; storeId: string; createdAt: string; items: OrderItem[]; subtotal: number; shipping: number; tax: number; discount: number; total: number; currency: string; status: OrderStatus; paymentStatus: PaymentStatus; shippingAddress: Address; billingAddress?: Address; shippingMethod: OrderShippingInfo }`
  - `UserProfile`: Contains `wishlistProductIds: string[]` and `orderHistory: Order[]`.

- **`src/types/store.ts` (lines 19-33)**:
  - `StoreConfig`: `{ id: string; name: string; tagline: string; industry: string; currency: string; currencySymbol?: string; theme: ThemeTokens; sections: SectionConfig[]; navigation: NavigationItem[]; freeShippingThreshold: number; standardShippingRate?: number; taxRate?: number }`

### 1.2 Storage Utilities in `src/utils/storage.ts`
- **Key Namespacing (lines 81-85)**: `buildStorageKey(storeId, key)` constructs `shopify_portfolio:${encodeURIComponent(storeId)}:${key}`.
- **Store Factory (lines 290-299)**: `createStoreStorage(storeId)` returns `{ get, set, remove, clear, subscribe }`.
- **Cross-Tab & Same-Window Reactivity (lines 244-285)**: `subscribeToStorage(storeId, key, callback)` attaches to both native `window.addEventListener('storage', ...)` and custom event `shopify_portfolio:storage_change`.
- **Fault Tolerance (lines 26-148)**: Provides `MemoryStorage` fallback when LocalStorage is disabled or throws `QuotaExceededError`, and recovers from corrupted JSON by resetting to default value.

### 1.3 Behavioral Contracts in `tests/harness/reference-engine.ts`
- **Line Item ID Rule (line 70)**: `${product.id}-${targetVariant.id}`.
- **Variant Fallback (lines 62-64)**: If `variantId` is omitted, defaults to `product.variants[0]`.
- **Quantity Validation (lines 58-60)**: `if (quantity <= 0) throw new Error('Quantity must be greater than 0');`.
- **Update Quantity to 0 (lines 102-105)**: If `quantity <= 0`, calls `removeItem(lineItemId)`.
- **Free Shipping Logic (lines 123-149)**:
  - `qualifiesForFreeShipping = subtotal >= threshold && subtotal > 0`
  - If `items.length === 0`: `shipping = 0`, `freeShippingProgress = 0`.
  - If `threshold === 0`: `shipping = 0`, `freeShippingProgress = 0`.
  - Otherwise: `freeShippingProgress = Math.min(100, Math.round((subtotal / threshold) * 100))`, `amountNeededForFreeShipping = Math.max(0, Math.round((threshold - subtotal) * 100) / 100)`.
- **Float Rounding (lines 120, 129, 130)**: `Math.round(val * 100) / 100` to prevent IEEE 754 precision drift.
- **Wishlist Storage Key (lines 171, 177)**: Storage key is `'wishlist'`, storing `string[]` of product IDs.
- **Wishlist Move to Cart (lines 204-207)**: Removes product from wishlist, calls `cart.addItem(product, variantId, 1)`.
- **Checkout State Machine (lines 403-461)**:
  - Step sequence: `'information'` -> `'shipping'` -> `'payment'` -> `'confirmation'`.
  - Validation: Email must contain `@`, first and last name required, address + city + postal code required.
  - Step progression guards: Cannot skip to shipping before info; cannot skip to payment before shipping.
  - Payment validation: Card number digits >= 13; `isDemo === true` required.
  - Completion: Order ID format `DEMO-ORD-${timestamp}-${random}`, cart automatically cleared, completed order recorded.

### 1.4 Test Suite Verification Results
- `npm test`: 35 unit tests passed.
- `npm run test:e2e`: 188/188 E2E tests passed across all 4 tiers (Feature, Boundary, Interaction, Scenario).

---

## 2. Logic Chain

From the observations above, we infer the following design principles and state requirements:

1. **Dual React Context & Headless Architecture**:
   To ensure high UI flexibility across 4 visually distinct stores (and future stores) while guaranteeing 100% test compatibility, state logic must be split into:
   - Pure functional helpers (`calculateCartTotals`, `validateCheckoutStep`, `generateOrderId`).
   - React Context Providers (`CartProvider`, `WishlistProvider`, `CheckoutProvider`).
   - Ergonomic Custom Hooks (`useCart`, `useWishlist`, `useCheckout`).

2. **Multi-Store Isolation & Dynamic Store Binding**:
   Shoppers can browse `/coffee`, `/fashion`, `/jewelry`, and `/electronics`.
   - Each store has its own distinct cart, wishlist, and shipping threshold in `shopify_portfolio:${storeId}:${key}`.
   - `CartProvider` and `WishlistProvider` must accept an optional `storeId?: string` prop or consume `useStore()` from `StoreContext`, defaulting to `'global'` if unspecified.
   - When the active store switches (e.g., navigating from `/coffee` to `/fashion`), the context must cleanly switch storage namespace, unsubscribe from previous listeners, and load the new store's items without state leakage.

3. **Float Precision & Edge Case Invariants**:
   - `0` quantity passed to `addItem` must throw `Error('Quantity must be greater than 0')`.
   - `0` or negative quantity passed to `updateQuantity` must cleanly remove the item.
   - `freeShippingProgress` must clamp strictly between `0` and `100`.
   - When `freeShippingThreshold <= 0`, `freeShippingProgress` must be `0`, and shipping must be `0.00`.
   - When cart is empty (`items.length === 0`), `shipping` must be `0.00` and `freeShippingProgress` must be `0`.
   - All financial numbers must be rounded using `Math.round(val * 100) / 100`.

4. **Wishlist Move-to-Cart Atomicity**:
   - `moveToCart(product, variantId)` removes `product.id` from wishlist and immediately calls `addItem(product, variantId, 1)`.
   - This ensures the UI count updates simultaneously in the header and cart drawer.

5. **Simulated Checkout Flow Guards & Order Record Creation**:
   - Checkout is strictly linear. Attempting to jump steps or submit incomplete steps throws standard errors.
   - Payment requires `isDemo === true`.
   - Upon successful payment:
     1. Creates order with unique `id: DEMO-ORD-...` conforming to `src/types/order.ts`.
     2. Calls `clearCart()` which flushes both in-memory cart and namespaced localStorage.
     3. Appends the order to namespaced `order_history` storage key for Demo Account viewing.
     4. Advances step to `'confirmation'`.

---

## 3. Detailed Technical Blueprint

### 3.1 Cart Context (`src/engine/CartContext.tsx`)

#### Interface Specification
```typescript
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { StoreConfig } from '../types/store';

export interface CartCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingProgress: number; // 0 - 100
  amountNeededForFreeShipping: number;
  totalQuantity: number;
  discountAmount: number;
}

export interface CartContextValue extends CartCalculation {
  items: CartItem[];
  addItem: (product: Product, variantId?: string, quantity?: number) => CartItem;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  appliedDiscountCode: string | null;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
}

export interface CartProviderProps {
  children: React.ReactNode;
  storeId?: string;
  storeConfig?: Partial<StoreConfig>;
}
```

#### Pure Calculation Helper
```typescript
export function calculateCartTotals(
  items: CartItem[],
  storeConfig?: Partial<StoreConfig>,
  discountAmount: number = 0
): CartCalculation {
  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const threshold = storeConfig?.freeShippingThreshold ?? 50.0;
  const standardShipping = storeConfig?.standardShippingRate ?? 5.0;
  const taxRate = storeConfig?.taxRate ?? 0.08;

  const qualifiesForFreeShipping = (threshold === 0 && items.length > 0) || (subtotal >= threshold && subtotal > 0);
  const shipping = (qualifiesForFreeShipping || items.length === 0) ? 0.0 : standardShipping;

  const effectiveSubtotal = Math.max(0, subtotal - discountAmount);
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
```

#### Core Context Implementation Guidelines
- **Storage Key**: `'cart_items'` via `createStoreStorage(resolvedStoreId)`.
- **Initialization**:
  ```typescript
  const [items, setItems] = useState<CartItem[]>(() => {
    return createStoreStorage(resolvedStoreId).get<CartItem[]>('cart_items', []);
  });
  ```
- **Reactivity on Store Change**:
  ```typescript
  useEffect(() => {
    const storage = createStoreStorage(resolvedStoreId);
    setItems(storage.get<CartItem[]>('cart_items', []));

    const unsubscribe = storage.subscribe<CartItem[]>('cart_items', (updatedItems) => {
      setItems(Array.isArray(updatedItems) ? updatedItems : []);
    });

    return () => unsubscribe();
  }, [resolvedStoreId]);
  ```
- **Sync to Storage**:
  On every state modification (`addItem`, `removeItem`, `updateQuantity`, `clearCart`), write to storage immediately:
  `createStoreStorage(resolvedStoreId).set('cart_items', nextItems)`.
- **`addItem` Implementation**:
  ```typescript
  const addItem = (product: Product, variantId?: string, quantity: number = 1): CartItem => {
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
    let resultItem: CartItem;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === lineItemId);
      let updated: CartItem[];

      if (existingIndex > -1) {
        resultItem = {
          ...prevItems[existingIndex],
          quantity: prevItems[existingIndex].quantity + quantity,
        };
        updated = [...prevItems];
        updated[existingIndex] = resultItem;
      } else {
        resultItem = {
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
        updated = [...prevItems, resultItem];
      }

      createStoreStorage(resolvedStoreId).set('cart_items', updated);
      return updated;
    });

    return resultItem!;
  };
  ```
- **`updateQuantity` Implementation**:
  ```typescript
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === itemId ? { ...item, quantity } : item));
      createStoreStorage(resolvedStoreId).set('cart_items', updated);
      return updated;
    });
  };
  ```
- **`removeItem` Implementation**:
  ```typescript
  const removeItem = (itemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      createStoreStorage(resolvedStoreId).set('cart_items', updated);
      return updated;
    });
  };
  ```
- **`clearCart` Implementation**:
  ```typescript
  const clearCart = () => {
    setItems([]);
    setAppliedDiscountCode(null);
    setDiscountAmount(0);
    createStoreStorage(resolvedStoreId).set('cart_items', []);
  };
  ```
- **Promo Discount Codes**:
  Support standard demo promo codes (e.g. `'WELCOME10'` for 10% off, `'SAVE20'` for 20% off, `'FREESHIP'` for full shipping discount).

---

### 3.2 Wishlist Context (`src/engine/WishlistContext.tsx`)

#### Interface Specification
```typescript
import { Product } from '../types/product';

export interface WishlistContextValue {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  has: (productId: string) => boolean; // Alias for test compatibility
  addItem: (productId: string) => void;
  add: (productId: string) => void; // Alias
  removeItem: (productId: string) => void;
  remove: (productId: string) => void; // Alias
  toggleItem: (productId: string) => boolean;
  toggle: (productId: string) => boolean; // Alias
  moveToCart: (product: Product, variantId?: string) => void;
  clearWishlist: () => void;
  clear: () => void; // Alias
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
}

export interface WishlistProviderProps {
  children: React.ReactNode;
  storeId?: string;
}
```

#### Core Context Implementation Guidelines
- **Storage Key**: `'wishlist'` storing `string[]` of product IDs.
- **Cross-Store Namespacing**: Scoped via `createStoreStorage(resolvedStoreId)`.
- **Toggle Method**:
  ```typescript
  const toggleItem = (productId: string): boolean => {
    let added = false;
    setWishlistIds((prev) => {
      let updated: string[];
      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
        added = false;
      } else {
        updated = [...prev, productId];
        added = true;
      }
      createStoreStorage(resolvedStoreId).set('wishlist', updated);
      return updated;
    });
    return added;
  };
  ```
- **Move to Cart Method**:
  ```typescript
  const { addItem: addCartItem } = useCart();

  const moveToCart = (product: Product, variantId?: string) => {
    removeItem(product.id);
    addCartItem(product, variantId, 1);
  };
  ```

---

### 3.3 Simulated 4-Step Checkout Flow (`src/engine/CheckoutContext.tsx` & `src/engine/checkout.ts`)

#### State & Data Contracts
```typescript
import { CartItem, CheckoutStep } from '../types/cart';
import { Address, Order, OrderStatus, PaymentStatus } from '../types/order';

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
  customerInfo: CustomerInfo | null;
  shippingMethod: ShippingMethodSelection | null;
  paymentDetails: PaymentSubmission | null;
  completedOrder: Order | null;
  availableShippingMethods: ShippingMethodSelection[];
  setCustomerInfo: (info: CustomerInfo) => void;
  setShippingMethod: (method: ShippingMethodSelection) => void;
  processPayment: (payment: PaymentSubmission) => Order;
  goToStep: (step: CheckoutStep) => void;
  resetCheckout: () => void;
  error: string | null;
}
```

#### Step Progression & Validation State Machine
1. **Step 1: Information Validation**:
   ```typescript
   export function validateCustomerInfo(info: CustomerInfo): void {
     if (!info.email || !info.email.includes('@')) {
       throw new Error('Invalid email address');
     }
     if (!info.firstName.trim() || !info.lastName.trim()) {
       throw new Error('First and last name are required');
     }
     if (!info.address.trim() || !info.city.trim() || !info.postalCode.trim()) {
       throw new Error('Complete shipping address required');
     }
   }
   ```
   When validated successfully, step transitions to `'shipping'`.

2. **Step 2: Shipping Method Selection**:
   - Guard:
     ```typescript
     if (currentStep !== 'shipping' && !customerInfo) {
       throw new Error('Cannot set shipping before information step');
     }
     ```
   - Derived Available Shipping Methods:
     - If `cart.subtotal >= cart.freeShippingThreshold` or `cart.freeShippingThreshold === 0`:
       - `{ id: 'free', name: 'Free Standard Shipping', rate: 0.0, estimatedDelivery: '3-5 business days' }`
     - Otherwise:
       - `{ id: 'standard', name: 'Standard Shipping', rate: storeConfig.standardShippingRate ?? 5.0, estimatedDelivery: '3-5 business days' }`
     - Express Courier option:
       - `{ id: 'express', name: 'Express Courier', rate: 15.0, estimatedDelivery: '1-2 business days' }`
   - When selected, step transitions to `'payment'`.

3. **Step 3: Payment UI & Submission**:
   - Guard:
     ```typescript
     if (currentStep !== 'payment' && !shippingMethod) {
       throw new Error('Cannot process payment before shipping step');
     }
     ```
   - Validation:
     ```typescript
     const rawDigits = payment.cardNumber.replace(/\s/g, '');
     if (!payment.cardNumber || rawDigits.length < 13) {
       throw new Error('Valid credit card number required');
     }
     if (!payment.isDemo) {
       throw new Error('Demo transaction confirmation required');
     }
     ```
   - Order Generation:
     ```typescript
     const orderId = `DEMO-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
     const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
     const orderShippingFee = shippingMethod.rate;
     const finalTotal = Math.round((cart.subtotal + orderShippingFee + cart.tax - cart.discountAmount) * 100) / 100;

     const order: Order = {
       id: orderId,
       orderNumber,
       storeId: resolvedStoreId,
       createdAt: new Date().toISOString(),
       items: cart.items.map((item) => ({
         id: item.id,
         productId: item.productId,
         variantId: item.variantId,
         title: item.title,
         variantTitle: item.variantTitle,
         price: item.price,
         quantity: item.quantity,
         imageUrl: item.imageUrl,
         selectedOptions: item.selectedOptions,
       })),
       subtotal: cart.subtotal,
       shipping: orderShippingFee,
       tax: cart.tax,
       discount: cart.discountAmount,
       total: finalTotal,
       currency: storeConfig?.currency ?? 'USD',
       status: 'confirmed',
       paymentStatus: 'paid',
       shippingAddress: {
         id: `addr-${Date.now()}`,
         firstName: customerInfo.firstName,
         lastName: customerInfo.lastName,
         addressLine1: customerInfo.address,
         addressLine2: customerInfo.apartment,
         city: customerInfo.city,
         stateOrProvince: customerInfo.state || '',
         postalCode: customerInfo.postalCode,
         country: customerInfo.country,
         phone: customerInfo.phone,
       },
       shippingMethod: {
         name: shippingMethod.name,
         price: orderShippingFee,
         trackingNumber: `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
       },
     };
     ```
   - State Transition & Storage Persistence:
     1. Append `order` to `order_history` in `createStoreStorage(resolvedStoreId)`.
     2. Call `cart.clearCart()` to empty cart items in state and storage.
     3. Set `completedOrder = order`.
     4. Transition step to `'confirmation'`.

4. **Step 4: Confirmation UI**:
   - Read-only display of order summary, order ID, items breakdown, shipping address, and tracking preview.
   - Demo confirmation banner: "This is a simulated order. No funds were debited and no items will be shipped."
   - Action buttons: "Continue Shopping" (navigates back to store homepage) or "View Account" (navigates to `/account`).

---

## 4. Caveats

1. **Pure Frontend Simulation**:
   No real payment gateway (Stripe, PayPal, Shopify Checkout API) is integrated. The 4-step flow is strictly client-side simulated, compliant with requirement R1.
2. **Persistence Lifetime**:
   State persistence relies on browser `localStorage` namespaced by store. If a user clears browser site data, stored carts and wishlists are reset to defaults. `MemoryStorage` fallback protects against private-browsing or sandbox quota exceptions.
3. **Discount Codes Scope**:
   Discount code logic supports client-side demo promotion codes (`WELCOME10`, `SAVE20`, `FREESHIP`). Dynamic coupon backend validation is intentionally omitted as per the demo specification.
4. **No Direct Source Changes during Exploration**:
   As an explorer agent, no files in `src/` were modified. All code presented in this blueprint is ready for implementation by the Worker agent.

---

## 5. Conclusion

- **CartContext** is fully designed to deliver variant-aware line item management, reactive multi-store persistence, real-time totals with IEEE 754 precision protection, free shipping progress bar calculations, and drawer toggle controls.
- **WishlistContext** provides atomic add/remove/toggle operations, cross-store storage namespacing, and an integrated `moveToCart` workflow.
- **Simulated 4-Step Checkout** implements a robust state machine (`information` -> `shipping` -> `payment` -> `confirmation`) with step-skipping guards, input validation, required demo mode verification, order ID generation, automatic cart clearing, and order history persistence.
- The design strictly preserves 100% compatibility with all 188 existing E2E tests, zero `any` type contracts, and the architectural patterns of `PROJECT.md`.

---

## 6. Verification Method

To independently verify the implementation once executed by the Worker agent:

1. **TypeScript Type Safety Check**:
   ```powershell
   npm run lint
   ```
   *Expected*: `tsc --noEmit` exits with code 0 and zero type errors.

2. **Full Regression E2E Suite**:
   ```powershell
   npm run test:e2e
   ```
   *Expected*: All 188 tests across Tiers 1-4 pass cleanly with 0 failures:
   - Tier 1 Feature 05 (`t1_05_cart_operations.test.ts`)
   - Tier 1 Feature 06 (`t1_06_free_shipping_threshold.test.ts`)
   - Tier 1 Feature 07 (`t1_07_storage_persistence.test.ts`)
   - Tier 1 Feature 08 (`t1_08_wishlist_workflow.test.ts`)
   - Tier 1 Feature 10 (`t1_10_simulated_checkout.test.ts`)
   - Tier 2 Boundaries 01, 02, 08 (`cart_boundaries`, `shipping_threshold_boundaries`, `checkout_validation_boundaries`)
   - Tier 3 Interactions 04, 06, 09 (`wishlist_filter_move_to_cart`, `multi_tab_sync`, `full_checkout_order_history`)
   - Tier 4 Scenarios S1, S5 (`s1_coffee_connoisseur`, `s5_multi_store_isolation`)

3. **Dedicated Unit Testing for Contexts**:
   Add test specifications under `src/engine/__tests__/`:
   - `CartContext.test.tsx`: Verify `addItem`, `updateQuantity`, `removeItem`, `clearCart`, free shipping calculations, drawer toggles.
   - `WishlistContext.test.tsx`: Verify toggle, `moveToCart`, persistence.
   - `CheckoutContext.test.tsx`: Verify 4-step sequence, validation errors, payment processing, cart clearing.
   Run:
   ```powershell
   npm test
   ```

4. **Production Build Verification**:
   ```powershell
   npm run build
   ```
   *Expected*: Clean production build output in `dist/` with exit code 0.

5. **Invalidation Conditions**:
   The implementation is invalid if:
   - `addItem(product, variantId, 0)` does not throw an error.
   - `updateQuantity(itemId, 0)` fails to remove the line item.
   - Subtotal or total values contain floating point representation errors (e.g., `59.970000000000006`).
   - `freeShippingProgress` exceeds 100 or is negative.
   - Checkout advances to shipping or payment without fulfilling preceding step validations.
   - Payment without `isDemo: true` succeeds.
   - Completing checkout fails to clear the active cart.
