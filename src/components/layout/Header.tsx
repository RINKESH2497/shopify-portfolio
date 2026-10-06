import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  User,
  ChevronDown,
  Activity,
  Sparkles,
  Store,
} from 'lucide-react';
import { useStore } from '../../engine/StoreContext';
import { useCart } from '../../engine/CartContext';
import { useWishlist } from '../../engine/WishlistContext';
import { useSearch } from '../../engine/SearchContext';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  onOpenMobileNav: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav, className }) => {
  const navigate = useNavigate();
  const { storeId, storeConfig, availableStores, setStoreId } = useStore();
  const { totalQuantity, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { openSearch } = useSearch();

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);

  const headerStyle = storeConfig?.theme?.layout?.headerStyle || 'centered';

  const handleStoreChange = (newStoreId: string) => {
    setIsStoreMenuOpen(false);
    setStoreId(newStoreId);
    navigate(`/${newStoreId}`);
  };

  // Shared Action Icons: Search, Wishlist, Account, Cart, Store Switcher
  const renderActions = () => (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {/* Search trigger */}
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search catalog (Cmd+K)"
        className="p-2 text-[var(--color-text,#111827)] hover:text-[var(--color-primary,#111827)] hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 rounded-full transition-colors relative"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Wishlist Link */}
      <Link
        to={`/${storeId}/account`}
        aria-label={`Wishlist (${wishlistCount} items)`}
        className="p-2 text-[var(--color-text,#111827)] hover:text-[var(--color-primary,#111827)] hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 rounded-full transition-colors relative hidden sm:inline-flex"
      >
        <Heart className="w-5 h-5" />
        {wishlistCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-in zoom-in-75">
            {wishlistCount}
          </span>
        )}
      </Link>

      {/* Account Link */}
      <Link
        to={`/${storeId}/account`}
        aria-label="My Account"
        className="p-2 text-[var(--color-text,#111827)] hover:text-[var(--color-primary,#111827)] hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 rounded-full transition-colors hidden sm:inline-flex"
      >
        <User className="w-5 h-5" />
      </Link>

      {/* Cart Trigger */}
      <button
        type="button"
        onClick={openCart}
        aria-label={`Shopping Cart (${totalQuantity} items)`}
        className="p-2 text-[var(--color-text,#111827)] hover:text-[var(--color-primary,#111827)] hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 rounded-full transition-colors relative"
      >
        <ShoppingBag className="w-5 h-5" />
        {totalQuantity > 0 && (
          <span className="absolute top-1 right-1 min-w-[1.125rem] h-4 px-1 bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] rounded-full text-[10px] font-bold flex items-center justify-center animate-in zoom-in-75">
            {totalQuantity}
          </span>
        )}
      </button>

      {/* Store Switcher Pill / Dropdown */}
      <div className="relative ml-1 sm:ml-2">
        <button
          type="button"
          onClick={() => setIsStoreMenuOpen((prev) => !prev)}
          aria-expanded={isStoreMenuOpen}
          aria-label="Switch store"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] hover:border-[var(--color-primary,#111827)] transition-all shadow-2xs"
        >
          <Store className="w-3.5 h-3.5 text-[var(--color-primary,#111827)]" />
          <span className="hidden md:inline capitalize">{storeId}</span>
          <ChevronDown className="w-3 h-3 text-[var(--color-text-muted,#6b7280)]" />
        </button>

        {isStoreMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsStoreMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)] border-b border-[var(--color-border,#e5e7eb)] mb-1">
                Demo Stores
              </div>
              {availableStores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => handleStoreChange(store.id)}
                  className={cn(
                    'w-full text-left px-2.5 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors',
                    store.id === storeId
                      ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] font-semibold'
                      : 'text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <span className="truncate">{store.name}</span>
                  <span className="text-[10px] uppercase opacity-75">{store.industry}</span>
                </button>
              ))}
              <div className="border-t border-[var(--color-border,#e5e7eb)] mt-1 pt-1">
                <Link
                  to="/"
                  onClick={() => setIsStoreMenuOpen(false)}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-1.5"
                >
                  <span>All Stores Hub</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // 1. Centered Header Layout (Coffee "Terroir & Roast")
  if (headerStyle === 'centered') {
    return (
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)]/95 backdrop-blur-md transition-all',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Left: Hamburger & Navigation */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onOpenMobileNav}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 -ml-2 text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <nav className="hidden lg:flex items-center gap-6">
                <Link
                  to={`/${storeId}/collections/all`}
                  className="text-sm font-medium text-[var(--color-text,#111827)] hover:text-[var(--color-primary,#111827)] transition-colors"
                >
                  All Products
                </Link>
                {storeConfig.navigation.slice(0, 2).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-sm font-medium text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Brand Logo */}
            <div className="text-center">
              <Link
                to={`/${storeId}`}
                className="inline-block group"
              >
                <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-primary,#111827)] block">
                  {storeConfig.name}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted,#6b7280)] hidden sm:block">
                  {storeConfig.industry} Atelier
                </span>
              </Link>
            </div>

            {/* Right: Actions & Optional extra link */}
            <div className="flex items-center gap-6">
              <nav className="hidden lg:flex items-center gap-6">
                {storeConfig.navigation.slice(2, 4).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-sm font-medium text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {renderActions()}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 2. Left-Aligned Minimalist Header (Fashion "Atelier Noir")
  if (headerStyle === 'left-aligned') {
    return (
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] transition-all',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand Logo & Desktop Nav Links side-by-side */}
            <div className="flex items-center gap-8 lg:gap-12">
              <button
                type="button"
                onClick={onOpenMobileNav}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 -ml-2 text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link
                to={`/${storeId}`}
                className="font-heading text-lg sm:text-2xl font-black uppercase tracking-tighter text-[var(--color-primary,#111827)]"
              >
                {storeConfig.name}
              </Link>

              <nav className="hidden lg:flex items-center gap-6">
                <Link
                  to={`/${storeId}/collections/all`}
                  className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text,#111827)] hover:text-[var(--color-primary,#111827)] transition-colors"
                >
                  Catalog
                </Link>
                {storeConfig.navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: Actions */}
            {renderActions()}
          </div>
        </div>
      </header>
    );
  }

  // 3. Transparent Overlay Luxury Header (Jewelry "L'Étoile Joaillerie")
  if (headerStyle === 'transparent-overlay') {
    return (
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b border-[var(--color-border,#3D372E)]/60 bg-[var(--color-background,#0D0C0A)]/90 backdrop-blur-md text-[var(--color-text,#FAF7F2)] transition-all',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-22">
            {/* Left: Hamburger & Navigation */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={onOpenMobileNav}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 -ml-2 text-[var(--color-text,#FAF7F2)] hover:bg-white/10 rounded-md transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <nav className="hidden lg:flex items-center gap-8">
                <Link
                  to={`/${storeId}/collections/all`}
                  className="text-xs uppercase tracking-widest font-serif font-medium text-[var(--color-accent,#DFBD78)] hover:text-white transition-colors"
                >
                  Collections
                </Link>
                {storeConfig.navigation.slice(0, 2).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-xs uppercase tracking-widest font-serif font-medium text-[var(--color-text-muted,#A39988)] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Luxury Crest Logo */}
            <div className="text-center">
              <Link
                to={`/${storeId}`}
                className="inline-flex flex-col items-center group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary,#C5A059)] mb-1" />
                <span className="font-heading text-lg sm:text-2xl font-serif tracking-widest text-[var(--color-primary,#C5A059)] uppercase">
                  {storeConfig.name}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted,#A39988)]">
                  Haute Joaillerie Paris
                </span>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-8">
              <nav className="hidden lg:flex items-center gap-8">
                {storeConfig.navigation.slice(2, 4).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-xs uppercase tracking-widest font-serif font-medium text-[var(--color-text-muted,#A39988)] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {renderActions()}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 4. Tech HUD Header (Electronics "Nexus Tech")
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-[var(--color-border,#1E293B)] bg-[var(--color-background,#0B0F19)] text-[var(--color-text,#E2E8F0)] transition-all font-mono',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Mobile trigger & Logo with Telemetry indicator */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={onOpenMobileNav}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-[var(--color-text,#E2E8F0)] hover:bg-neutral-800 rounded-md transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              to={`/${storeId}`}
              className="flex items-center gap-2 group"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary,#00E5FF)] animate-pulse" />
              <span className="font-heading text-base sm:text-xl font-bold tracking-tight text-[var(--color-text,#E2E8F0)] uppercase group-hover:text-[var(--color-primary,#00E5FF)] transition-colors">
                {storeConfig.name}
              </span>
            </Link>

            {/* HUD Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded border border-[var(--color-border,#1E293B)] bg-[var(--color-surface,#131B2E)] text-[10px] text-[var(--color-primary,#00E5FF)] font-mono">
              <Activity className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
              <span>CORE: ACTIVE [240HZ]</span>
            </div>
          </div>

          {/* Center: Tech Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs">
            <Link
              to={`/${storeId}/collections/all`}
              className="text-[var(--color-primary,#00E5FF)] hover:underline"
            >
              [ALL_HARDWARE]
            </Link>
            {storeConfig.navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-[var(--color-text-muted,#94A3B8)] hover:text-[var(--color-primary,#00E5FF)] transition-colors"
              >
                /{item.label.toUpperCase()}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          {renderActions()}
        </div>
      </div>
    </header>
  );
};

export default Header;
