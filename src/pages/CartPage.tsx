import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { useCart } from '../engine/CartContext';
import { useStore } from '../engine/StoreContext';
import { Button } from '../components/common/Button';
import { ImageWithFallback, ImageCategory } from '../components/common/ImageWithFallback';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../utils/cn';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    shipping,
    tax,
    total,
    discountAmount,
    appliedDiscountCode,
    applyDiscount,
    removeDiscount,
    updateQuantity,
    removeItem,
    clearCart,
    freeShippingThreshold,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  const { storeId, storeConfig } = useStore();
  const currency = storeConfig?.currency || 'USD';

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const success = applyDiscount(promoInput);
    if (success) {
      setPromoInput('');
      setPromoError(null);
    } else {
      setPromoError('Invalid coupon code. Try WELCOME10, SAVE20, or FREESHIP');
    }
  };

  const hasFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-[var(--color-text-muted,#6b7280)] mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text,#111827)] font-heading">
          Your Cart is Empty
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted,#6b7280)] max-w-md mx-auto">
          You haven&apos;t added any products to your cart yet. Discover our curated collection crafted with passion.
        </p>
        <div className="mt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/${storeId}/collections/all`)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Collections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Clear Cart */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border,#e5e7eb)] mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-text,#111827)] font-heading">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted,#6b7280)] mt-1">
            Review your items and proceed to checkout
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[var(--color-text-muted,#6b7280)] hover:text-red-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Items Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Free Shipping Alert Bar */}
          {freeShippingThreshold > 0 && (
            <div className="p-4 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f9fafb)] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text,#111827)]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {hasFreeShipping ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      You&apos;ve unlocked Free Shipping!
                    </span>
                  ) : (
                    <span>
                      Add <strong>{formatCurrency(amountNeededForFreeShipping, currency)}</strong> more to receive Free Shipping
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500 ease-out rounded-full',
                    hasFreeShipping ? 'bg-emerald-500' : 'bg-[var(--color-primary,#111827)]'
                  )}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Line Items List */}
          <div className="divide-y divide-[var(--color-border,#e5e7eb)] border-y border-[var(--color-border,#e5e7eb)]">
            {items.map((item) => (
              <div key={item.id} className="py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    aspectRatio="square"
                    fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[var(--color-text,#111827)]">
                    <Link
                      to={`/${storeId}/products/${item.productId.replace(/^[a-z]+-prod-/, '')}`}
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  {item.variantTitle && (
                    <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-0.5">
                      {item.variantTitle}
                    </p>
                  )}
                  <span className="text-xs font-semibold text-[var(--color-text-muted,#6b7280)] block mt-1">
                    {formatCurrency(item.price, currency)} each
                  </span>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Stepper */}
                  <div className="flex items-center rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[5rem]">
                    <span className="text-base font-extrabold text-[var(--color-text,#111827)] block">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="p-1 text-[var(--color-text-muted,#6b7280)] hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to={`/${storeId}/collections/all`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary,#111827)] hover:underline"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[var(--color-text,#111827)]">
              Order Summary
            </h2>

            {/* Discount Code Form */}
            <div>
              {appliedDiscountCode ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedDiscountCode}</strong> applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    aria-label="Remove coupon"
                    className="hover:text-red-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <label htmlFor="cart-coupon-input" className="sr-only">Coupon code</label>
                    <input
                      id="cart-coupon-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Coupon: WELCOME10"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#111827)]"
                    />
                    <Button type="submit" variant="outline" size="sm">
                      Apply
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {promoError}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm border-t border-[var(--color-border,#e5e7eb)] pt-4">
              <div className="flex justify-between text-[var(--color-text-muted,#6b7280)]">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--color-text,#111827)]">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount, currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--color-text-muted,#6b7280)]">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-[var(--color-text,#111827)]">
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping, currency)}
                </span>
              </div>

              <div className="flex justify-between text-[var(--color-text-muted,#6b7280)]">
                <span>Estimated Tax</span>
                <span className="font-semibold text-[var(--color-text,#111827)]">
                  {formatCurrency(tax, currency)}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-[var(--color-text,#111827)] border-t border-[var(--color-border,#e5e7eb)] pt-3">
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/${storeId}/checkout`)}
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
