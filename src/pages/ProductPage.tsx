import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
  Share2,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react';
import { useStore } from '../engine/StoreContext';
import { useCart } from '../engine/CartContext';
import { useWishlist } from '../engine/WishlistContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/common/Tabs';
import { ImageWithFallback, ImageCategory } from '../components/common/ImageWithFallback';
import { ProductCard } from '../sections/products/ProductCard';
import { ProductVariant } from '../types/product';
import { formatCurrency, formatDiscount } from '../utils/formatters';
import { cn } from '../utils/cn';

export const ProductPage: React.FC = () => {
  const { storeId, storeConfig, getProductByHandle, getRelatedProducts } = useStore();
  const { handle = '' } = useParams<{ handle: string }>();

  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const product = getProductByHandle(handle);

  // Active image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Selected options state map (e.g. { Size: 'M', Color: 'Noir' })
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // Added animation state
  const [isAdded, setIsAdded] = useState(false);

  // Initialize selected options from first available variant or first variant
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      const defaultVariant =
        product.variants?.find((v) => v.availableForSale && v.inventoryQuantity > 0) ||
        product.variants?.[0];

      if (defaultVariant?.options) {
        setSelectedOptions(defaultVariant.options);
      } else if (product.options) {
        const initialOpts: Record<string, string> = {};
        product.options.forEach((opt) => {
          if (opt.values.length > 0) {
            initialOpts[opt.name] = opt.values[0];
          }
        });
        setSelectedOptions(initialOpts);
      }
    }
  }, [product, handle]);

  // Derive matching variant from selectedOptions
  const activeVariant = useMemo<ProductVariant | undefined>(() => {
    if (!product || !product.variants) return undefined;

    return product.variants.find((variant) => {
      return Object.entries(selectedOptions).every(
        ([optName, optValue]) => variant.options[optName] === optValue
      );
    }) || product.variants[0];
  }, [product, selectedOptions]);

  // Active pricing based on selected variant
  const currentPrice = activeVariant ? activeVariant.price : product?.price || 0;
  const currentCompareAtPrice = activeVariant
    ? activeVariant.compareAtPrice
    : product?.compareAtPrice;

  const isSoldOut = activeVariant
    ? !activeVariant.availableForSale || activeVariant.inventoryQuantity <= 0
    : false;

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getRelatedProducts(product.id, product.category, 4);
  }, [product, getRelatedProducts]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-extrabold text-[var(--color-text,#111827)] font-heading">
          Product Not Found
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted,#6b7280)]">
          The requested product could not be located in {storeConfig?.name}.
        </p>
        <Link
          to={`/${storeId}/collections/all`}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]"
        >
          <span>Return to Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (isSoldOut || !product) return;

    addItem(product, activeVariant?.id, quantity);
    openCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const currency = storeConfig?.currency || 'USD';
  const discountInfo = formatDiscount(currentPrice, currentCompareAtPrice, currency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-[var(--color-text-muted,#6b7280)] truncate">
          <li>
            <Link to={`/${storeId}`} className="hover:text-[var(--color-text,#111827)] transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              to={`/${storeId}/collections/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="hover:text-[var(--color-text,#111827)] transition-colors"
            >
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-[var(--color-text,#111827)] truncate max-w-xs">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Main PDP Grid: Gallery on Left, Info & Variant Selectors on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Gallery */}
        <div className="space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-[var(--color-border,#e5e7eb)] shadow-xs">
            <ImageWithFallback
              src={product.images?.[selectedImageIndex]?.url || product.images?.[0]?.url}
              alt={product.images?.[selectedImageIndex]?.altText || product.title}
              aspectRatio="square"
              fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isSoldOut ? (
                <Badge variant="secondary" size="md">
                  Sold Out
                </Badge>
              ) : discountInfo?.hasDiscount ? (
                <Badge variant="sale" size="md">
                  {discountInfo.label}
                </Badge>
              ) : product.tags?.includes('new') ? (
                <Badge variant="primary" size="md">
                  New Arrival
                </Badge>
              ) : null}
            </div>

            {/* Wishlist Button Overlay */}
            <button
              type="button"
              onClick={() => toggleItem(product.id)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-md text-neutral-800 dark:text-neutral-100 hover:scale-110 active:scale-95 transition-all"
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isWishlisted ? 'fill-red-500 text-red-500' : 'hover:text-red-500'
                )}
              />
            </button>
          </div>

          {/* Thumbnails Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={cn(
                    'relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all',
                    selectedImageIndex === idx
                      ? 'border-[var(--color-primary,#111827)] ring-2 ring-[var(--color-primary,#111827)]/20'
                      : 'border-transparent hover:border-[var(--color-border,#e5e7eb)] opacity-70 hover:opacity-100'
                  )}
                >
                  <ImageWithFallback
                    src={img.url}
                    alt={img.altText || `${product.title} thumbnail ${idx + 1}`}
                    aspectRatio="square"
                    fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selectors */}
        <div className="flex flex-col space-y-6">
          {/* Eyebrow & Ratings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary,#111827)]">
                {product.category}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-[var(--color-text,#111827)] font-bold">
                    {product.rating.average.toFixed(1)}
                  </span>
                  <span className="text-[var(--color-text-muted,#6b7280)] font-normal">
                    ({product.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[var(--color-text,#111827)] tracking-tight">
              {product.title}
            </h1>

            {product.subtitle && (
              <p className="text-sm sm:text-base text-[var(--color-text-muted,#6b7280)] mt-1.5 leading-relaxed">
                {product.subtitle}
              </p>
            )}
          </div>

          {/* Pricing Section */}
          <div className="flex items-baseline gap-3 pb-6 border-b border-[var(--color-border,#e5e7eb)]">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text,#111827)]">
              {formatCurrency(currentPrice, currency)}
            </span>
            {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
              <span className="text-base sm:text-lg text-[var(--color-text-muted,#6b7280)] line-through">
                {formatCurrency(currentCompareAtPrice, currency)}
              </span>
            )}
            {discountInfo?.hasDiscount && (
              <Badge variant="sale" size="sm">
                Save {discountInfo.label}
              </Badge>
            )}
          </div>

          {/* Variant Selectors */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-5">
              {product.options.map((option) => (
                <div key={option.name}>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-text,#111827)] mb-2.5">
                    <span>{option.name}</span>
                    <span className="text-[var(--color-text-muted,#6b7280)] font-normal capitalize">
                      Selected: {selectedOptions[option.name]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => {
                      const isSelected = selectedOptions[option.name] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleOptionChange(option.name, val)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-xs font-semibold border transition-all select-none',
                            isSelected
                              ? 'border-[var(--color-primary,#111827)] bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] shadow-xs scale-102'
                              : 'border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] hover:border-neutral-400'
                          )}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector & Add to Cart Action */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center rounded-xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  aria-label="Decrease quantity"
                  className="p-2 text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-[var(--color-text,#111827)] font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isSoldOut}
                  aria-label="Increase quantity"
                  className="p-2 text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button
                variant="primary"
                size="lg"
                disabled={isSoldOut}
                onClick={handleAddToCart}
                className="flex-1"
                leftIcon={isAdded ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              >
                {isSoldOut ? 'Sold Out' : isAdded ? 'Added to Cart' : `Add to Cart — ${formatCurrency(currentPrice * quantity, currency)}`}
              </Button>
            </div>

            {/* Inventory Status Feedback */}
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted,#6b7280)]">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  isSoldOut ? 'bg-red-500' : 'bg-emerald-500'
                )}
              />
              <span>
                {isSoldOut
                  ? 'Currently unavailable in selected variant'
                  : `In Stock: ${activeVariant?.inventoryQuantity ?? 18} units remaining`}
              </span>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="border-t border-[var(--color-border,#e5e7eb)] pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--color-text-muted,#6b7280)]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[var(--color-primary,#111827)] shrink-0" />
              <span>Free delivery over ${storeConfig?.freeShippingThreshold || 50}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary,#111827)] shrink-0" />
              <span>Authentic craftsmanship</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[var(--color-primary,#111827)] shrink-0" />
              <span>30-day hassle-free returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Reviews */}
      <div className="mt-16 lg:mt-24 pt-12 border-t border-[var(--color-border,#e5e7eb)]">
        <Tabs defaultValue="description">
          <TabsList variant="line" className="justify-center sm:justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            {product.specifications && (
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            )}
            <TabsTrigger value="reviews">Customer Reviews ({product.rating?.count || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="max-w-3xl space-y-4 text-sm sm:text-base leading-relaxed text-[var(--color-text,#111827)]">
            <p>{product.description}</p>
            <p className="text-[var(--color-text-muted,#6b7280)]">
              Every detail has been carefully inspected to meet the rigorous quality standards of {storeConfig?.name}.
            </p>
          </TabsContent>

          {product.specifications && (
            <TabsContent value="specifications" className="max-w-2xl">
              <div className="rounded-xl border border-[var(--color-border,#e5e7eb)] overflow-hidden divide-y divide-[var(--color-border,#e5e7eb)]">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex px-4 py-3 text-xs sm:text-sm">
                    <span className="w-1/3 font-semibold text-[var(--color-text,#111827)]">
                      {key}
                    </span>
                    <span className="w-2/3 text-[var(--color-text-muted,#6b7280)] font-mono">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="reviews" className="max-w-3xl space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-[var(--color-border,#e5e7eb)] flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[var(--color-text,#111827)]">
                  {product.rating?.average.toFixed(1)} / 5.0
                </span>
                <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-1">
                  Based on {product.rating?.count} verified customer purchases
                </p>
              </div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-[var(--color-border,#e5e7eb)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text,#111827)]">
                You May Also Like
              </h2>
              <p className="text-xs text-[var(--color-text-muted,#6b7280)] mt-1">
                More recommendations in {product.category}
              </p>
            </div>
            <Link
              to={`/${storeId}/collections/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="text-xs font-semibold text-[var(--color-primary,#111827)] hover:underline flex items-center gap-1"
            >
              <span>View Category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add-to-Cart Bar (< 768px) */}
      <div className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-[var(--color-surface,#ffffff)]/95 backdrop-blur-md border-t border-[var(--color-border,#e5e7eb)] p-3 px-4 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
            <ImageWithFallback
              src={product.images?.[0]?.url}
              alt={product.title}
              aspectRatio="square"
              fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-[var(--color-text,#111827)] truncate">
              {product.title}
            </h4>
            <span className="text-xs font-bold text-[var(--color-primary,#111827)]">
              {formatCurrency(currentPrice, currency)}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={isSoldOut}
          onClick={handleAddToCart}
          className="shrink-0 px-4"
        >
          {isSoldOut ? 'Sold Out' : isAdded ? 'Added' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default ProductPage;
