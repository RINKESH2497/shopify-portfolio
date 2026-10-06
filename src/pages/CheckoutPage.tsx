import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldAlert,
  CreditCard,
  Truck,
  User,
  ArrowRight,
  ArrowLeft,
  Lock,
  Package,
} from 'lucide-react';
import { useCheckout, CustomerInfo, ShippingMethodSelection, PaymentSubmission } from '../engine/CheckoutContext';
import { useCart } from '../engine/CartContext';
import { useStore } from '../engine/StoreContext';
import { Button } from '../components/common/Button';
import { ImageWithFallback, ImageCategory } from '../components/common/ImageWithFallback';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../utils/cn';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    step,
    customerInfo,
    shippingMethod,
    availableShippingMethods,
    completedOrder,
    setCustomerInfo,
    setShippingMethod,
    processPayment,
    goToStep,
    resetCheckout,
    error,
    setError,
  } = useCheckout();

  const { items, subtotal, totalQuantity, discountAmount } = useCart();
  const { storeId, storeConfig } = useStore();
  const currency = storeConfig?.currency || 'USD';

  // Step 1: Form state
  const [formData, setFormData] = useState<CustomerInfo>({
    email: customerInfo?.email || 'alex.morgan@portfolio.demo',
    firstName: customerInfo?.firstName || 'Alex',
    lastName: customerInfo?.lastName || 'Morgan',
    address: customerInfo?.address || '742 Evergreen Terrace',
    apartment: customerInfo?.apartment || 'Suite 200',
    city: customerInfo?.city || 'Springfield',
    state: customerInfo?.state || 'OR',
    postalCode: customerInfo?.postalCode || '97477',
    country: customerInfo?.country || 'United States',
    phone: customerInfo?.phone || '+1 (555) 234-5678',
  });

  // Step 2: Selected shipping method state
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    shippingMethod?.id || availableShippingMethods[0]?.id || 'standard'
  );

  // Step 3: Payment form state
  const [paymentData, setPaymentData] = useState<PaymentSubmission>({
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvc: '123',
    isDemo: true,
    billingSameAsShipping: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1 submit
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCustomerInfo(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Step 2 submit
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = availableShippingMethods.find((m) => m.id === selectedMethodId);
    if (method) {
      setShippingMethod(method);
    }
  };

  // Step 3 submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      try {
        processPayment(paymentData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsProcessing(false);
      }
    }, 600);
  };

  // If cart is empty and not on confirmation step, offer redirect
  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
        <h2 className="text-2xl font-bold text-[var(--color-text,#111827)] font-heading">
          No Items to Checkout
        </h2>
        <p className="text-sm text-[var(--color-text-muted,#6b7280)] mt-2">
          Your shopping cart is currently empty.
        </p>
        <Button
          variant="primary"
          size="md"
          className="mt-6"
          onClick={() => navigate(`/${storeId}/collections/all`)}
        >
          Return to Store
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background,#ffffff)] pb-16">
      {/* Prominent Demo Mode Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            <strong>DEMO CHECKOUT MODE:</strong> No real payment will be charged. All transactions are simulated and stored locally.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step Indicator Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
            <button
              type="button"
              disabled={step === 'confirmation'}
              onClick={() => goToStep('information')}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                step === 'information'
                  ? 'text-[var(--color-primary,#111827)] font-bold'
                  : 'text-[var(--color-text-muted,#6b7280)]'
              )}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center border text-[11px]">1</span>
              <span>Information</span>
            </button>
            <div className="w-10 h-px bg-[var(--color-border,#e5e7eb)]" />
            <button
              type="button"
              disabled={!customerInfo || step === 'confirmation'}
              onClick={() => goToStep('shipping')}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                step === 'shipping'
                  ? 'text-[var(--color-primary,#111827)] font-bold'
                  : 'text-[var(--color-text-muted,#6b7280)]'
              )}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center border text-[11px]">2</span>
              <span>Shipping</span>
            </button>
            <div className="w-10 h-px bg-[var(--color-border,#e5e7eb)]" />
            <button
              type="button"
              disabled={!customerInfo || !shippingMethod || step === 'confirmation'}
              onClick={() => goToStep('payment')}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                step === 'payment'
                  ? 'text-[var(--color-primary,#111827)] font-bold'
                  : 'text-[var(--color-text-muted,#6b7280)]'
              )}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center border text-[11px]">3</span>
              <span>Payment</span>
            </button>
            <div className="w-10 h-px bg-[var(--color-border,#e5e7eb)]" />
            <div
              className={cn(
                'flex items-center gap-1.5',
                step === 'confirmation'
                  ? 'text-[var(--color-primary,#111827)] font-bold'
                  : 'text-[var(--color-text-muted,#6b7280)]'
              )}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center border text-[11px]">4</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        {/* Main Grid: Steps on Left, Order Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form Area */}
          <div className="lg:col-span-7">
            {/* Step 1: Customer Information */}
            {step === 'information' && (
              <form onSubmit={handleInfoSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text,#111827)] font-heading">
                    Contact & Shipping Details
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-1">
                    Enter the recipient address for this simulated delivery.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#111827)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.apartment || ''}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={formData.state || ''}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Link
                    to={`/${storeId}/cart`}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Cart</span>
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Shipping
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Shipping Method */}
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text,#111827)] font-heading">
                    Select Shipping Method
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-1">
                    Delivering to: {customerInfo?.address}, {customerInfo?.city}
                  </p>
                </div>

                <div className="space-y-3">
                  {availableShippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all',
                        selectedMethodId === method.id
                          ? 'border-[var(--color-primary,#111827)] bg-[var(--color-primary,#111827)]/5 ring-1 ring-[var(--color-primary,#111827)]'
                          : 'border-[var(--color-border,#e5e7eb)] hover:bg-neutral-50 dark:hover:bg-neutral-900'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={selectedMethodId === method.id}
                          onChange={() => setSelectedMethodId(method.id)}
                          className="w-4 h-4 text-[var(--color-primary,#111827)]"
                        />
                        <div>
                          <span className="text-sm font-semibold text-[var(--color-text,#111827)] block">
                            {method.name}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted,#6b7280)]">
                            {method.estimatedDelivery}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-text,#111827)]">
                        {method.rate === 0 ? 'FREE' : formatCurrency(method.rate, currency)}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => goToStep('information')}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Information</span>
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Payment UI */}
            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text,#111827)] font-heading">
                    Simulated Payment
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-1">
                    All payment transactions are mock processed and stored in local memory.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f9fafb)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text,#111827)] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      Mock Credit Card
                    </span>
                    <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted,#6b7280)]" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] font-mono text-[var(--color-text,#111827)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentData.expiry}
                        onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] font-mono text-[var(--color-text,#111827)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                        Security Code (CVC)
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentData.cvc}
                        onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] font-mono text-[var(--color-text,#111827)]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-text,#111827)]">
                      <input
                        type="checkbox"
                        checked={paymentData.isDemo}
                        onChange={(e) => setPaymentData({ ...paymentData, isDemo: e.target.checked })}
                        className="w-4 h-4 rounded text-[var(--color-primary,#111827)]"
                      />
                      <span>I understand this is a simulated demo transaction</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => goToStep('shipping')}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Shipping</span>
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isProcessing}
                    loadingText="Processing Mock Order..."
                  >
                    Complete Order
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Order Confirmation */}
            {step === 'confirmation' && completedOrder && (
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h2 className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 font-heading">
                    Thank You for Your Order!
                  </h2>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Your order <strong>{completedOrder.orderNumber}</strong> has been confirmed and logged in your simulated account.
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--color-border,#e5e7eb)] p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--color-text,#111827)] uppercase tracking-wider">
                    Order Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--color-text-muted,#6b7280)] block">Order Number</span>
                      <strong className="text-[var(--color-text,#111827)] font-mono">{completedOrder.orderNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted,#6b7280)] block">Date</span>
                      <span className="text-[var(--color-text,#111827)]">{new Date(completedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted,#6b7280)] block">Shipping Address</span>
                      <span className="text-[var(--color-text,#111827)] block">
                        {completedOrder.shippingAddress.firstName} {completedOrder.shippingAddress.lastName}
                      </span>
                      <span className="text-[var(--color-text-muted,#6b7280)] block">
                        {completedOrder.shippingAddress.addressLine1}, {completedOrder.shippingAddress.city}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted,#6b7280)] block">Delivery Service</span>
                      <span className="text-[var(--color-text,#111827)]">{completedOrder.shippingMethod.name}</span>
                      <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 block mt-0.5">
                        {completedOrder.shippingMethod.trackingNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      resetCheckout();
                      navigate(`/${storeId}`);
                    }}
                    className="flex-1"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      resetCheckout();
                      navigate(`/${storeId}/account`);
                    }}
                    className="flex-1"
                  >
                    View Account Orders
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar (When not on confirmation) */}
          {step !== 'confirmation' && (
            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] p-6 space-y-6 shadow-2xs">
                <h3 className="text-base font-bold text-[var(--color-text,#111827)]">
                  Order Summary ({totalQuantity})
                </h3>

                {/* Items preview list */}
                <div className="divide-y divide-[var(--color-border,#e5e7eb)] max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.title}
                          aspectRatio="square"
                          fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-[var(--color-text,#111827)] truncate">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-[var(--color-text-muted,#6b7280)] block">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-text,#111827)] shrink-0">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-2 text-xs border-t border-[var(--color-border,#e5e7eb)] pt-4 text-[var(--color-text-muted,#6b7280)]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[var(--color-text,#111827)]">
                      {formatCurrency(subtotal, currency)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-[var(--color-text,#111827)]">
                      {shippingMethod ? (shippingMethod.rate === 0 ? 'FREE' : formatCurrency(shippingMethod.rate, currency)) : 'Calculated next step'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[var(--color-text,#111827)] border-t border-[var(--color-border,#e5e7eb)] pt-3">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        subtotal + (shippingMethod?.rate || 0) - discountAmount,
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
