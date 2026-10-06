import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { ImageWithFallback, ImageCategory } from '../common/ImageWithFallback';
import { useCart } from '../../engine/CartContext';
import { useStore } from '../../engine/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: explicitIsOpen,
  onClose: explicitOnClose,
}) => {
  const navigate = useNavigate();
  const {
    items,
    isCartOpen,
    closeCart,
    subtotal,
    totalQuantity,
    updateQuantity,
    removeItem,
    freeShippingThreshold,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  const { storeId, storeConfig } = useStore();

  const isOpen = explicitIsOpen !== undefined ? explicitIsOpen : isCartOpen;
  const onClose = explicitOnClose || closeCart;

  const handleCheckout = () => {
    onClose();
    navigate(`/${storeId}/checkout`);
  };

  const handleViewCart = () => {
    onClose();
    navigate(`/${storeId}/cart`);
  };

  const currency = storeConfig?.currency || 'USD';
  const hasFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      title={`Your Cart (${totalQuantity})`}
      className="max-w-md w-full"
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            {/* Subtotal row */}
            <div className="flex items-center justify-between text-base font-semibold text-[var(--color-text,#111827)]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted,#6b7280)]">
              Taxes and shipping calculated at checkout.
            </p>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={handleViewCart}
                fullWidth
              >
                View Cart
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCheckout}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                fullWidth
              >
                Checkout
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="flex flex-col h-full space-y-6">
        {/* Free Shipping Progress Indicator */}
        {freeShippingThreshold > 0 && (
          <div className="p-3.5 rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f9fafb)] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text,#111827)]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {hasFreeShipping ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Congratulations! You unlocked Free Shipping.
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[var(--color-primary,#111827)]">{formatCurrency(amountNeededForFreeShipping, currency)}</strong> more for Free Shipping
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-text-muted,#6b7280)]">
                {freeShippingProgress}%
              </span>
            </div>
            {/* Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 ease-out rounded-full',
                  hasFreeShipping
                    ? 'bg-emerald-500'
                    : 'bg-[var(--color-primary,#111827)]'
                )}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Line Items List */}
        {items.length > 0 ? (
          <div className="flex-1 divide-y divide-[var(--color-border,#e5e7eb)] overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    aspectRatio="square"
                    fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info & Controls */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[var(--color-text,#111827)] truncate">
                        {item.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="text-[var(--color-text-muted,#9ca3af)] hover:text-red-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.variantTitle && (
                      <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-0.5 truncate">
                        {item.variantTitle}
                      </p>
                    )}
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-2.5">
                    {/* Stepper */}
                    <div className="inline-flex items-center rounded-md border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.title}`}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[var(--color-text,#111827)] transition-colors rounded-l-md"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold font-mono text-[var(--color-text,#111827)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.title}`}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[var(--color-text,#111827)] transition-colors rounded-r-md"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line total price */}
                    <span className="text-sm font-bold text-[var(--color-text,#111827)]">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[var(--color-text-muted,#6b7280)]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[var(--color-text,#111827)]">
                Your cart is empty
              </h3>
              <p className="text-xs text-[var(--color-text-muted,#6b7280)] max-w-xs">
                Explore our curated catalog and discover handcrafted products designed for your lifestyle.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                navigate(`/${storeId}/collections/all`);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;
