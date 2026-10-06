import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, ArrowRight, ShieldCheck, Truck, RefreshCw, Store } from 'lucide-react';
import { useStore } from '../../engine/StoreContext';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const { storeId, storeConfig, availableStores, setStoreId } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      className={cn(
        'w-full border-t border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f9fafb)] text-[var(--color-text,#111827)] transition-colors',
        className
      )}
    >
      {/* Upper Trust Badges Bar */}
      <div className="border-b border-[var(--color-border,#e5e7eb)] py-6 sm:py-8 bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="p-2.5 rounded-full bg-[var(--color-primary,#111827)]/10 text-[var(--color-primary,#111827)] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text,#111827)]">
                  Complimentary Shipping
                </h4>
                <p className="text-xs text-[var(--color-text-muted,#6b7280)]">
                  Free delivery on orders over ${storeConfig?.freeShippingThreshold || 50}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="p-2.5 rounded-full bg-[var(--color-primary,#111827)]/10 text-[var(--color-primary,#111827)] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text,#111827)]">
                  Artisan Quality Guaranteed
                </h4>
                <p className="text-xs text-[var(--color-text-muted,#6b7280)]">
                  Direct ethical trade and certified craftsmanship
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <div className="p-2.5 rounded-full bg-[var(--color-primary,#111827)]/10 text-[var(--color-primary,#111827)] shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text,#111827)]">
                  Hassle-Free Returns
                </h4>
                <p className="text-xs text-[var(--color-text-muted,#6b7280)]">
                  30-day money-back guarantee with prepaid returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info (2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to={`/${storeId}`} className="inline-block">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-primary,#111827)]">
                {storeConfig?.name}
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted,#6b7280)] max-w-sm leading-relaxed">
              {storeConfig?.tagline}
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--color-border,#e5e7eb)] hover:bg-[var(--color-primary,#111827)] hover:text-[var(--color-surface,#ffffff)] transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Portfolio Hub (Switch Brand)</span>
              </Link>
            </div>
          </div>

          {/* Catalog & Collections Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text,#111827)]">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted,#6b7280)]">
              <li>
                <Link
                  to={`/${storeId}/collections/all`}
                  className="hover:text-[var(--color-primary,#111827)] transition-colors"
                >
                  All Products
                </Link>
              </li>
              {storeConfig?.navigation.map((nav) => (
                <li key={nav.href}>
                  <Link
                    to={nav.href}
                    className="hover:text-[var(--color-primary,#111827)] transition-colors"
                  >
                    {nav.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text,#111827)]">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted,#6b7280)]">
              <li>
                <Link
                  to={`/${storeId}/account`}
                  className="hover:text-[var(--color-primary,#111827)] transition-colors"
                >
                  Order History & Tracking
                </Link>
              </li>
              <li>
                <Link
                  to={`/${storeId}/cart`}
                  className="hover:text-[var(--color-primary,#111827)] transition-colors"
                >
                  View Cart
                </Link>
              </li>
              <li>
                <Link
                  to={`/${storeId}/checkout`}
                  className="hover:text-[var(--color-primary,#111827)] transition-colors"
                >
                  Demo Checkout
                </Link>
              </li>
              <li>
                <span className="cursor-default">Privacy & Terms</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text,#111827)]">
              Newsletter
            </h4>
            <p className="text-xs text-[var(--color-text-muted,#6b7280)]">
              Subscribe to receive preview releases, tasting notes, and seasonal discounts.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-medium">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    aria-label="Newsletter email input"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] placeholder-[var(--color-text-muted,#9ca3af)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#111827)]"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  fullWidth
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Demo Stores Quick Switcher Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border,#e5e7eb)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--color-text-muted,#6b7280)] font-medium mr-1">
              Live Demo Stores:
            </span>
            {availableStores.map((s) => (
              <Link
                key={s.id}
                to={`/${s.id}`}
                onClick={() => setStoreId(s.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  s.id === storeId
                    ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-[var(--color-text,#111827)] hover:bg-neutral-200'
                )}
              >
                {s.name}
              </Link>
            ))}
          </div>

          <p className="text-xs text-[var(--color-text-muted,#6b7280)] text-center md:text-right">
            &copy; 2026 {storeConfig?.name}. Powered by Shopify Portfolio Shared Architecture.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
