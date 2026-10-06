import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../engine/StoreContext';
import { ProductCard } from '../sections/products/ProductCard';
import { Drawer } from '../components/common/Drawer';
import { Button } from '../components/common/Button';
import { Product } from '../types/product';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../utils/cn';

type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'title-asc'
  | 'title-desc';

export const CollectionPage: React.FC = () => {
  const { storeId, storeConfig, products, getAllCategories } = useStore();
  const { handle = 'all' } = useParams<{ handle: string }>();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (handle && handle !== 'all') {
      const match = getAllCategories().find(
        (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === handle.toLowerCase()
      );
      return match || 'all';
    }
    return 'all';
  });

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Mobile drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Available categories & tags
  const categories = useMemo(() => ['all', ...getAllCategories()], [getAllCategories]);
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    products.forEach((p) => (p.tags || []).forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet).slice(0, 8);
  }, [products]);

  // Handle URL handle change if navigating directly between collection links
  React.useEffect(() => {
    if (handle && handle !== 'all') {
      const match = getAllCategories().find(
        (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === handle.toLowerCase()
      );
      if (match) setSelectedCategory(match);
    } else if (handle === 'all') {
      setSelectedCategory('all');
    }
  }, [handle, getAllCategories]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
    setInStockOnly(false);
    setSelectedTag(null);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minRating !== null ||
    inStockOnly ||
    selectedTag !== null;

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Price range
        const min = minPrice !== '' ? parseFloat(minPrice) : null;
        const max = maxPrice !== '' ? parseFloat(maxPrice) : null;
        if (min !== null && !isNaN(min) && product.price < min) return false;
        if (max !== null && !isNaN(max) && product.price > max) return false;

        // Rating
        if (minRating !== null && (product.rating?.average || 0) < minRating) {
          return false;
        }

        // In Stock
        if (inStockOnly) {
          const hasStock = product.variants?.some(
            (v) => v.availableForSale && v.inventoryQuantity > 0
          );
          if (!hasStock) return false;
        }

        // Tag
        if (selectedTag) {
          if (!product.tags?.includes(selectedTag)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating-desc':
            return (b.rating?.average || 0) - (a.rating?.average || 0);
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'featured':
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [
    products,
    selectedCategory,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    selectedTag,
    sortBy,
  ]);

  // Reusable Filter Sidebar Content
  const renderFilterPanel = () => (
    <div className="space-y-6">
      {/* Category Facet */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text,#111827)] mb-3">
          Category
        </h3>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left capitalize',
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)] font-semibold'
                  : 'text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <span>{cat === 'all' ? 'All Products' : cat}</span>
              {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                <Check className="w-3.5 h-3.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="border-t border-[var(--color-border,#e5e7eb)] pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text,#111827)] mb-3">
          Price Range ({storeConfig?.currency || 'USD'})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="min-price-input" className="sr-only">Minimum price</label>
            <input
              id="min-price-input"
              type="number"
              placeholder="Min $"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#111827)]"
            />
          </div>
          <div>
            <label htmlFor="max-price-input" className="sr-only">Maximum price</label>
            <input
              id="max-price-input"
              type="number"
              placeholder="Max $"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#111827)]"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="border-t border-[var(--color-border,#e5e7eb)] pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text,#111827)] mb-3">
          Minimum Rating
        </h3>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setMinRating(minRating === rating ? null : rating)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                minRating === rating
                  ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]'
                  : 'text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)] hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating} & Up</span>
              </div>
              {minRating === rating && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only Checkbox */}
      <div className="border-t border-[var(--color-border,#e5e7eb)] pt-5">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-text,#111827)] select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-border,#e5e7eb)] text-[var(--color-primary,#111827)] focus:ring-[var(--color-primary,#111827)]"
          />
          <span>In Stock Items Only</span>
        </label>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="border-t border-[var(--color-border,#e5e7eb)] pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text,#111827)] mb-2.5">
            Tags & Features
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors capitalize',
                  selectedTag === tag
                    ? 'border-[var(--color-primary,#111827)] bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]'
                    : 'border-[var(--color-border,#e5e7eb)] text-[var(--color-text-muted,#6b7280)] hover:text-[var(--color-text,#111827)]'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset Action */}
      {hasActiveFilters && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            fullWidth
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 text-xs text-[var(--color-text-muted,#6b7280)]">
          <li>
            <Link to={`/${storeId}`} className="hover:text-[var(--color-text,#111827)] transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to={`/${storeId}/collections/all`} className="hover:text-[var(--color-text,#111827)] transition-colors">
              Collections
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-[var(--color-text,#111827)] capitalize">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </li>
        </ol>
      </nav>

      {/* Collection Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[var(--color-border,#e5e7eb)] gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text,#111827)] font-heading capitalize">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </h1>
          <p className="text-sm text-[var(--color-text-muted,#6b7280)] mt-1.5 max-w-xl">
            Showing {filteredProducts.length} curated product{filteredProducts.length === 1 ? '' : 's'} from {storeConfig?.name}.
          </p>
        </div>

        {/* Sort Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] hover:border-[var(--color-primary,#111827)]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary,#111827)]" />
            )}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <label htmlFor="collection-sort-select" className="sr-only">Sort products</label>
            <select
              id="collection-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none px-3.5 py-2 pr-8 text-xs font-semibold rounded-lg border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#111827)] cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Customer Rating</option>
              <option value="title-asc">Alphabetical: A to Z</option>
              <option value="title-desc">Alphabetical: Z to A</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted,#6b7280)]" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 py-4">
          <span className="text-xs font-medium text-[var(--color-text-muted,#6b7280)]">
            Active Filters:
          </span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-[var(--color-text,#111827)]">
              <span>Category: {selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-[var(--color-text,#111827)]">
              <span>Price: ${minPrice || '0'} - ${maxPrice || '∞'}</span>
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minRating !== null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-[var(--color-text,#111827)]">
              <span>Rating: {minRating}+ ★</span>
              <button
                type="button"
                onClick={() => setMinRating(null)}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-[var(--color-text,#111827)]">
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={() => setInStockOnly(false)}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-[var(--color-text,#111827)] capitalize">
              <span>Tag: {selectedTag}</span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[var(--color-primary,#111827)] hover:underline font-semibold ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Layout: Desktop Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 p-5 rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#ffffff)] shadow-2xs">
            {renderFilterPanel()}
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-20 text-center flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f9fafb)] p-8">
              <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[var(--color-text-muted,#6b7280)] mb-3">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-text,#111827)]">
                No products match your filters
              </h3>
              <p className="text-xs text-[var(--color-text-muted,#6b7280)] max-w-sm mt-1">
                Try loosening your filter constraints or reset all active filters to view all products.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetFilters}
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        placement="left"
        title="Filter & Sort"
        footer={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsFilterDrawerOpen(false)}
            fullWidth
          >
            Show {filteredProducts.length} Results
          </Button>
        }
      >
        {renderFilterPanel()}
      </Drawer>
    </div>
  );
};

export default CollectionPage;
