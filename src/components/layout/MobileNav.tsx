import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Heart, User, Search, Store } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { useStore } from '../../engine/StoreContext';
import { useCart } from '../../engine/CartContext';
import { useWishlist } from '../../engine/WishlistContext';
import { useSearch } from '../../engine/SearchContext';
import { cn } from '../../utils/cn';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { storeId, storeConfig, availableStores, setStoreId } = useStore();
  const { totalQuantity } = useCart();
  const { wishlistCount } = useWishlist();
  const { openSearch } = useSearch();

  const handleStoreSwitch = (newStoreId: string) => {
    setStoreId(newStoreId);
    onClose();
    navigate(`/${newStoreId}`);
  };

  const handleSearchClick = () => {
    onClose();
    openSearch();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="left"
      title="Navigation"
      className="max-w-xs sm:max-w-sm"
    >
      <div className="flex flex-col h-full justify-between gap-6 pb-6">
        <div className="flex flex-col gap-6">
          {/* Quick Search Action */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f9fafb)] text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] text-sm transition-colors text-left"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="flex-1">Search products...</span>
            <span className="text-[10px] font-mono border border-[var(--color-border,#e5e7eb)] px-1.5 py-0.5 rounded bg-background">
              ⌘K
            </span>
          </button>

          {/* Primary Navigation Links */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)] px-3 mb-1">
              Shop {storeConfig.name}
            </span>
            <Link
              to={`/${storeId}`}
              onClick={onClose}
              className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Home
            </Link>
            <Link
              to={`/${storeId}/collections/all`}
              onClick={onClose}
              className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              All Products
            </Link>
            {storeConfig.navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Account & Bag Links */}
          <div className="border-t border-[var(--color-border,#e5e7eb)] pt-4 flex flex-col space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)] px-3 mb-1">
              Account & Utilities
            </span>
            <Link
              to={`/${storeId}/cart`}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Shopping Cart</span>
              </div>
              {totalQuantity > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]">
                  {totalQuantity}
                </span>
              )}
            </Link>
            <Link
              to={`/${storeId}/account`}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to={`/${storeId}/account`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Customer Account</span>
            </Link>
          </div>
        </div>

        {/* Store Switcher Footer */}
        <div className="border-t border-[var(--color-border,#e5e7eb)] pt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)]">
              Switch Demo Store
            </span>
            <Link
              to="/"
              onClick={onClose}
              className="text-xs text-[var(--color-primary,#111827)] hover:underline flex items-center gap-1 font-medium"
            >
              <Store className="w-3 h-3" />
              Hub
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableStores.map((store) => (
              <button
                key={store.id}
                type="button"
                onClick={() => handleStoreSwitch(store.id)}
                className={cn(
                  'px-2.5 py-2 text-xs font-medium rounded-md border text-left transition-all capitalize flex flex-col',
                  store.id === storeId
                    ? 'border-[var(--color-primary,#111827)] bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] shadow-xs'
                    : 'border-[var(--color-border,#e5e7eb)] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[var(--color-text,#111827)]'
                )}
              >
                <span className="font-semibold truncate">{store.name}</span>
                <span className="text-[10px] opacity-75">{store.industry}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default MobileNav;
