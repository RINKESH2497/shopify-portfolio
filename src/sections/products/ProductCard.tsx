import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { Product } from '../../types/product';
import { CardStyleValue, BorderRadiusValue } from '../../types/theme';
import { useStore } from '../../engine/StoreContext';
import { useCart } from '../../engine/CartContext';
import { useWishlist } from '../../engine/WishlistContext';
import { Badge } from '../../components/common/Badge';
import { ImageWithFallback, ImageCategory } from '../../components/common/ImageWithFallback';
import { formatCurrency, formatDiscount } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export interface ProductCardProps {
  product: Product;
  cardStyle?: CardStyleValue;
  borderRadius?: BorderRadiusValue;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  showQuickAdd?: boolean;
  showWishlist?: boolean;
  showRating?: boolean;
  showBadges?: boolean;
  className?: string;
}

const CARD_STYLE_CLASSES: Record<CardStyleValue, string> = {
  flat: 'bg-transparent border-0 shadow-none hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30',
  bordered: 'border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] hover:border-[var(--color-primary,#111827)]',
  elevated: 'bg-[var(--color-surface,#ffffff)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent',
  glassmorphic: 'backdrop-blur-md bg-[var(--color-surface,#ffffff)]/75 border border-white/20 shadow-md hover:shadow-xl hover:bg-[var(--color-surface,#ffffff)]/85',
};

const BORDER_RADIUS_CLASSES: Record<BorderRadiusValue, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-3xl',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardStyle,
  borderRadius,
  aspectRatio = 'square',
  showQuickAdd = true,
  showWishlist = true,
  showRating = true,
  showBadges = true,
  className,
}) => {
  // Safe hook resolution for testing environments
  let storeId = 'coffee';
  let storeConfig: ReturnType<typeof useStore>['storeConfig'] | undefined;
  try {
    const store = useStore();
    storeId = store.storeId;
    storeConfig = store.storeConfig;
  } catch {
    // Fallback when outside StoreProvider
  }

  let addItem: ReturnType<typeof useCart>['addItem'] | undefined;
  let openCart: ReturnType<typeof useCart>['openCart'] | undefined;
  try {
    const cart = useCart();
    addItem = cart.addItem;
    openCart = cart.openCart;
  } catch {
    // Fallback when outside CartProvider
  }

  let isInWishlist = (_id: string): boolean => false;
  let toggleItem = (_id: string): boolean => false;
  try {
    const wishlist = useWishlist();
    isInWishlist = wishlist.isInWishlist;
    toggleItem = wishlist.toggleItem;
  } catch {
    // Fallback when outside WishlistProvider
  }

  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Active theme shape tokens fallback
  const resolvedCardStyle = cardStyle || storeConfig?.theme?.shape?.cardStyle || 'bordered';
  const resolvedBorderRadius = borderRadius || storeConfig?.theme?.shape?.borderRadius || 'md';

  const isWishlisted = isInWishlist(product.id);

  // Sold out calculation
  const isSoldOut = useMemo<boolean>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.every((v) => !v.availableForSale || v.inventoryQuantity <= 0);
    }
    return false;
  }, [product.variants]);

  // Discount calculation
  const discountInfo = useMemo(() => {
    return formatDiscount(product.price, product.compareAtPrice, storeConfig?.currency || 'USD');
  }, [product.price, product.compareAtPrice, storeConfig?.currency]);

  // Quick Add handler
  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) return;

    const availableVariant =
      product.variants?.find((v) => v.availableForSale && v.inventoryQuantity > 0) ||
      product.variants?.[0];

    if (addItem) {
      addItem(product, availableVariant?.id, 1);
    }
    if (openCart) {
      openCart();
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  // Wishlist Toggle handler
  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
  };

  // Secondary hover image
  const primaryImage = product.images?.[0]?.url;
  const secondaryImage = product.images?.[1]?.url;
  const displayImage = isHovered && secondaryImage ? secondaryImage : primaryImage;

  const productLink = `/${storeId}/products/${product.handle}`;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col overflow-hidden transition-all duration-300',
        CARD_STYLE_CLASSES[resolvedCardStyle] || CARD_STYLE_CLASSES.bordered,
        BORDER_RADIUS_CLASSES[resolvedBorderRadius] || BORDER_RADIUS_CLASSES.md,
        className
      )}
    >
      {/* Product Image & Badges Container */}
      <div className="relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <Link
          to={productLink}
          aria-label={product.title}
          className="block w-full"
        >
          <ImageWithFallback
            src={displayImage}
            alt={product.images?.[0]?.altText || product.title}
            aspectRatio={aspectRatio}
            fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        {showBadges && (
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
            {isSoldOut ? (
              <Badge variant="secondary" size="sm" className="font-semibold uppercase tracking-wider">
                Sold Out
              </Badge>
            ) : discountInfo?.hasDiscount ? (
              <Badge variant="sale" size="sm">
                {discountInfo.label}
              </Badge>
            ) : product.tags?.includes('new') ? (
              <Badge variant="primary" size="sm" className="font-semibold uppercase tracking-wider">
                New
              </Badge>
            ) : product.featured ? (
              <Badge variant="outline" size="sm" className="bg-surface/80 backdrop-blur-sm">
                Featured
              </Badge>
            ) : null}
          </div>
        )}

        {/* Top Right Wishlist Toggle */}
        {showWishlist && (
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
            aria-pressed={isWishlisted}
            className={cn(
              'absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all duration-200',
              'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm',
              'hover:bg-white dark:hover:bg-neutral-800 hover:scale-110 active:scale-95',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isWishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-neutral-700 dark:text-neutral-200 hover:text-red-500'
              )}
            />
          </button>
        )}

        {/* Desktop Slide-up Quick Add Bar */}
        {showQuickAdd && (
          <div className="absolute inset-x-2 bottom-2 z-10 hidden sm:block translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              disabled={isSoldOut}
              onClick={handleQuickAdd}
              aria-label={isSoldOut ? `${product.title} is sold out` : `Quick add ${product.title} to cart`}
              className={cn(
                'w-full py-2.5 px-3 rounded-[var(--radius-btn,0.375rem)] font-medium text-xs md:text-sm tracking-wide',
                'flex items-center justify-center gap-2 shadow-md transition-all duration-200 select-none',
                isSoldOut
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-400'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] hover:opacity-90 active:scale-[0.98]'
              )}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isSoldOut ? 'Sold Out' : 'Quick Add'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Card Content Information */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Category / Eyebrow */}
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted,#6b7280)] mb-1">
            {product.category}
          </span>
        )}

        {/* Product Title Link */}
        <h3 className="font-heading text-sm sm:text-base font-semibold text-[var(--color-text,#111827)] line-clamp-1 mb-1.5 group-hover:text-[var(--color-primary,#111827)] transition-colors">
          <Link to={productLink}>
            {product.title}
          </Link>
        </h3>

        {/* Rating Stars */}
        {showRating && product.rating && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-medium text-[var(--color-text,#111827)]">
              {product.rating.average.toFixed(1)}
            </span>
            <span className="text-xs text-[var(--color-text-muted,#6b7280)]">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price & Savings */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold text-[var(--color-text,#111827)]">
            {formatCurrency(product.price, storeConfig?.currency || 'USD')}
          </span>

          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs sm:text-sm text-[var(--color-text-muted,#6b7280)] line-through">
              {formatCurrency(product.compareAtPrice, storeConfig?.currency || 'USD')}
            </span>
          )}
        </div>

        {/* Mobile Quick Add Button (Always visible on touch screens) */}
        {showQuickAdd && (
          <div className="mt-3 block sm:hidden">
            <button
              type="button"
              disabled={isSoldOut}
              onClick={handleQuickAdd}
              className={cn(
                'w-full py-2 px-3 rounded-[var(--radius-btn,0.375rem)] font-medium text-xs',
                'flex items-center justify-center gap-1.5 transition-colors select-none',
                isSoldOut
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] active:opacity-80'
              )}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
