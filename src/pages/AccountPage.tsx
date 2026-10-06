import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  ShieldAlert,
  X,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAccount } from '../engine/AccountContext';
import { useWishlist } from '../engine/WishlistContext';
import { useStore } from '../engine/StoreContext';
import { useCart } from '../engine/CartContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/common/Tabs';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ImageWithFallback, ImageCategory } from '../components/common/ImageWithFallback';
import { Address } from '../types/order';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../utils/cn';

export const AccountPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    addresses,
    addAddress,
    removeAddress,
    setDefaultAddress,
    orders,
    resetDemoAccount,
    isDemoMode,
    demoNoticeText,
    isSimulatedNoticeDismissed,
    dismissSimulatedNotice,
  } = useAccount();

  const { storeId, storeConfig, getProductById } = useStore();
  const { wishlistIds, removeItem: removeWishlist, moveToCart } = useWishlist();
  const { openCart } = useCart();
  const currency = storeConfig?.currency || 'USD';

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    country: 'United States',
    phone: profile.phone || '',
    isDefault: false,
  });

  // Filter orders by store
  const [orderFilterStore, setOrderFilterStore] = useState<'all' | string>('all');

  const filteredOrders = orders.filter((o) =>
    orderFilterStore === 'all' ? true : o.storeId === orderFilterStore
  );

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) return;

    addAddress(newAddress);
    setIsAddressModalOpen(false);
    setNewAddress({
      firstName: profile.firstName,
      lastName: profile.lastName,
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateOrProvince: '',
      postalCode: '',
      country: 'United States',
      phone: profile.phone || '',
      isDefault: false,
    });
  };

  const handleMoveToCart = (productId: string) => {
    const prod = getProductById(productId);
    if (prod) {
      moveToCart(prod);
      openCart();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Demo Notice Alert */}
      {isDemoMode && !isSimulatedNoticeDismissed && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Demo Account Mode
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                {demoNoticeText}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissSimulatedNotice}
            className="text-amber-700 hover:text-amber-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] shadow-2xs mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
          <ImageWithFallback
            src={profile.avatarUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
            aspectRatio="square"
            fallbackCategory="general"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--color-text,#111827)] font-heading">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-0.5">
                {profile.email} • {profile.phone}
              </p>
            </div>
            <Badge variant="primary" size="sm">
              Portfolio Demo Account
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted,#6b7280)] justify-center sm:justify-start">
            <span>
              Orders: <strong className="text-[var(--color-text,#111827)]">{orders.length}</strong>
            </span>
            <span>•</span>
            <span>
              Addresses: <strong className="text-[var(--color-text,#111827)]">{addresses.length}</strong>
            </span>
            <span>•</span>
            <span>
              Wishlist: <strong className="text-[var(--color-text,#111827)]">{wishlistIds.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Account Tabs */}
      <Tabs defaultValue="orders">
        <TabsList variant="line" className="mb-8">
          <TabsTrigger value="orders">
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Order History</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Addresses ({addresses.length})</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlistIds.length})</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Orders */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)]">
              Showing {filteredOrders.length} Order{filteredOrders.length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <label htmlFor="order-store-filter" className="text-[var(--color-text-muted,#6b7280)]">Store:</label>
              <select
                id="order-store-filter"
                value={orderFilterStore}
                onChange={(e) => setOrderFilterStore(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)]"
              >
                <option value="all">All Stores</option>
                <option value="coffee">Coffee</option>
                <option value="fashion">Fashion</option>
                <option value="jewelry">Jewelry</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border,#e5e7eb)] text-xs">
                    <div>
                      <span className="font-bold text-[var(--color-text,#111827)] font-mono text-sm block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[var(--color-text-muted,#6b7280)]">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {order.storeId}
                      </span>
                      <Badge variant="success" size="sm">
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="divide-y divide-[var(--color-border,#e5e7eb)]">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                            <ImageWithFallback
                              src={item.imageUrl}
                              alt={item.title}
                              aspectRatio="square"
                              fallbackCategory="general"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--color-text,#111827)] block">
                              {item.title}
                            </span>
                            <span className="text-[var(--color-text-muted,#6b7280)]">
                              Qty: {item.quantity} • {item.variantTitle}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-[var(--color-text,#111827)]">
                          {formatCurrency(item.price * item.quantity, order.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs font-semibold text-[var(--color-text,#111827)]">
                    <span>Total Paid</span>
                    <span className="text-base font-extrabold">{formatCurrency(order.total, order.currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[var(--color-text-muted,#6b7280)] border rounded-2xl">
              No orders found matching the filter.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Addresses */}
        <TabsContent value="addresses" className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)]">
              Saved Delivery Addresses
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddressModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Address
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={cn(
                  'p-5 rounded-2xl border transition-all space-y-3 relative',
                  addr.isDefault
                    ? 'border-[var(--color-primary,#111827)] bg-[var(--color-primary,#111827)]/5 ring-1 ring-[var(--color-primary,#111827)]'
                    : 'border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text,#111827)]">
                    {addr.firstName} {addr.lastName}
                  </span>
                  {addr.isDefault ? (
                    <Badge variant="primary" size="sm">
                      Default
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-[11px] text-[var(--color-primary,#111827)] hover:underline font-semibold"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="text-xs text-[var(--color-text-muted,#6b7280)] leading-relaxed">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.stateOrProvince} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  {addr.phone && <p className="mt-1">{addr.phone}</p>}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeAddress(addr.id)}
                    aria-label="Delete address"
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Wishlist */}
        <TabsContent value="wishlist" className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)]">
              Saved Products ({wishlistIds.length})
            </span>
          </div>

          {wishlistIds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlistIds.map((id) => {
                const prod = getProductById(id);
                if (!prod) return null;

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                        <ImageWithFallback
                          src={prod.images?.[0]?.url}
                          alt={prod.title}
                          aspectRatio="square"
                          fallbackCategory="general"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted,#6b7280)]">
                          {prod.category}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--color-text,#111827)] truncate">
                          {prod.title}
                        </h4>
                        <span className="text-xs font-bold text-[var(--color-text,#111827)] block mt-0.5">
                          {formatCurrency(prod.price, currency)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border,#e5e7eb)]">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMoveToCart(prod.id)}
                        leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeWishlist(prod.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-[var(--color-text-muted,#6b7280)] border rounded-2xl">
              Your wishlist is currently empty.
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Settings & Data Reset */}
        <TabsContent value="settings" className="max-w-2xl space-y-6">
          <div className="p-6 rounded-2xl border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 space-y-3">
            <h3 className="text-base font-bold text-red-900 dark:text-red-200">
              Reset Simulated Account State
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300">
              This will restore all simulated addresses, orders, and preferences back to the initial baseline demo dataset.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={resetDemoAccount}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Demo Account Data
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Delivery Address"
        size="md"
      >
        <form onSubmit={handleCreateAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={newAddress.firstName}
                onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={newAddress.lastName}
                onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)]"
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
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)]"
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
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                State
              </label>
              <input
                type="text"
                value={newAddress.stateOrProvince}
                onChange={(e) => setNewAddress({ ...newAddress, stateOrProvince: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text,#111827)] mb-1">
                Postal Code
              </label>
              <input
                type="text"
                required
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border,#e5e7eb)]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-text,#111827)]">
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--color-primary,#111827)]"
              />
              <span>Set as default shipping address</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountPage;
