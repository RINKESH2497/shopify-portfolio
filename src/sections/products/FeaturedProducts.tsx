import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FeaturedProductsSettings } from '../../types/section';
import { Product } from '../../types/product';
import { useStore } from '../../engine/StoreContext';
import { ProductCard } from './ProductCard';
import { cn } from '../../utils/cn';

export interface FeaturedProductsProps {
  settings: FeaturedProductsSettings;
  id?: string;
  className?: string;
}

const COLUMN_GRID_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto',
  4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto',
};

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  settings,
  id,
  className,
}) => {
  let storeId = 'coffee';
  let storeConfig: ReturnType<typeof useStore>['storeConfig'] | undefined;
  let products: Product[] = [];
  let getFeaturedProducts = (_limit?: number): Product[] => [];
  let getProductsByCategory = (_cat: string): Product[] => [];

  try {
    const store = useStore();
    storeId = store.storeId;
    storeConfig = store.storeConfig;
    products = store.products;
    getFeaturedProducts = store.getFeaturedProducts;
    getProductsByCategory = store.getProductsByCategory;
  } catch {
    // Fallback when outside StoreProvider
  }

  // Defensive fallback for heading/title from fixtures
  const displayHeading =
    settings.heading ||
    (settings as unknown as { title?: string }).title ||
    'Featured Products';

  const columns = settings.columns || 4;
  const limit = settings.limit || (columns === 2 ? 4 : columns === 3 ? 6 : 8);

  // Resolve matching products
  const displayedProducts = useMemo<Product[]>(() => {
    let resolved: Product[] = [];

    if (settings.productHandles && settings.productHandles.length > 0) {
      const lowerHandles = settings.productHandles.map((h) => h.toLowerCase());
      resolved = lowerHandles
        .map((handle) => products.find((p) => p.handle.toLowerCase() === handle))
        .filter((p): p is Product => p !== undefined);
    } else if (settings.collectionHandle) {
      resolved = getProductsByCategory(settings.collectionHandle);
    } else {
      resolved = getFeaturedProducts(limit);
    }

    return resolved.slice(0, limit);
  }, [settings, products, limit, getFeaturedProducts, getProductsByCategory]);

  const viewAllUrl =
    settings.viewAllLink ||
    `/${storeId}/collections/${settings.collectionHandle || 'all'}`;

  const viewAllText = settings.viewAllText || 'View All Products';

  const contentDensity = storeConfig?.theme?.layout?.contentDensity || 'comfortable';
  const densityPadding =
    contentDensity === 'spacious'
      ? 'py-16 md:py-24'
      : contentDensity === 'dense'
      ? 'py-8 md:py-12'
      : 'py-12 md:py-16';

  return (
    <section
      id={id}
      className={cn('w-full px-4 sm:px-6 lg:px-8', densityPadding, className)}
      aria-label={displayHeading}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            {settings.subheading && (
              <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-[var(--color-primary,#111827)] mb-1.5">
                {settings.subheading}
              </p>
            )}
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text,#111827)]">
              {displayHeading}
            </h2>
          </div>

          {/* Desktop View All Link */}
          <Link
            to={viewAllUrl}
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text,#111827)] hover:text-[var(--color-primary,#111827)] transition-colors group"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className={cn('grid gap-4 sm:gap-6', COLUMN_GRID_CLASSES[columns])}>
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cardStyle={storeConfig?.theme?.shape?.cardStyle}
                borderRadius={storeConfig?.theme?.shape?.borderRadius}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[var(--color-border,#e5e7eb)]">
            <p className="text-sm text-[var(--color-text-muted,#6b7280)] mb-4">
              No products found in this selection.
            </p>
            <Link
              to={`/${storeId}/collections/all`}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to={viewAllUrl}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-medium rounded-[var(--radius-btn,0.375rem)] border border-[var(--color-border,#e5e7eb)] text-[var(--color-text,#111827)] hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
