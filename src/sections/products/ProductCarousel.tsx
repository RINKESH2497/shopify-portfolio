import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCarouselSettings } from '../../types/section';
import { Product } from '../../types/product';
import { useStore } from '../../engine/StoreContext';
import { ProductCard } from './ProductCard';
import { cn } from '../../utils/cn';

export interface ProductCarouselProps {
  settings: ProductCarouselSettings;
  id?: string;
  className?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  settings,
  id,
  className,
}) => {
  let storeConfig: ReturnType<typeof useStore>['storeConfig'] | undefined;
  let products: Product[] = [];
  let getFeaturedProducts = (_limit?: number): Product[] => [];
  let getProductsByCategory = (_cat: string): Product[] => [];

  try {
    const store = useStore();
    storeConfig = store.storeConfig;
    products = store.products;
    getFeaturedProducts = store.getFeaturedProducts;
    getProductsByCategory = store.getProductsByCategory;
  } catch {
    // Fallback when outside StoreProvider
  }

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Defensive fallback for heading/title from fixtures
  const displayHeading =
    settings.heading ||
    (settings as unknown as { title?: string }).title ||
    'Featured Collection';

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
      resolved = getFeaturedProducts(10);
    }
    return resolved;
  }, [settings, products, getFeaturedProducts, getProductsByCategory]);

  // Update scroll boundaries & active dot index
  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const firstChild = el.firstElementChild as HTMLElement | null;
    const itemWidth = firstChild ? firstChild.clientWidth + 24 : clientWidth;
    const computedIndex = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(displayedProducts.length - 1, Math.max(0, computedIndex)));
  }, [displayedProducts.length]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  // Navigation handlers
  const scrollPrev = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const step = firstChild ? firstChild.clientWidth + 24 : el.clientWidth * 0.75;
    el.scrollBy({ left: -step, behavior: 'smooth' });
  }, []);

  const scrollNext = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Loop back to start if at the end
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    const firstChild = el.firstElementChild as HTMLElement | null;
    const step = firstChild ? firstChild.clientWidth + 24 : el.clientWidth * 0.75;
    el.scrollBy({ left: step, behavior: 'smooth' });
  }, []);

  const scrollToSlide = useCallback((index: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const step = firstChild ? firstChild.clientWidth + 24 : el.clientWidth * 0.75;
    el.scrollTo({ left: index * step, behavior: 'smooth' });
  }, []);

  // Autoplay functionality with pause on hover
  useEffect(() => {
    if (!settings.autoplay || isHovered || displayedProducts.length <= 1) {
      return;
    }

    const intervalMs = settings.autoplayIntervalMs || 4500;
    const timer = setInterval(() => {
      scrollNext();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.autoplay, settings.autoplayIntervalMs, isHovered, displayedProducts.length, scrollNext]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollNext();
    }
  };

  const showArrows = settings.showArrows !== false;
  const showDots = settings.showDots !== false && displayedProducts.length > 1;

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
      className={cn('w-full overflow-hidden', densityPadding, className)}
      aria-label={displayHeading}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation Arrows */}
        <div className="flex items-end justify-between gap-4 mb-6 md:mb-10">
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

          {/* Carousel Arrow Controls */}
          {showArrows && displayedProducts.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollLeft}
                aria-label="Previous slide"
                className={cn(
                  'w-10 h-10 rounded-full border border-[var(--color-border,#e5e7eb)] flex items-center justify-center transition-all',
                  'bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]',
                  canScrollLeft
                    ? 'hover:bg-neutral-100 hover:scale-105 active:scale-95 shadow-sm'
                    : 'opacity-40 cursor-not-allowed'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollRight && !settings.autoplay}
                aria-label="Next slide"
                className={cn(
                  'w-10 h-10 rounded-full border border-[var(--color-border,#e5e7eb)] flex items-center justify-center transition-all',
                  'bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]',
                  canScrollRight || settings.autoplay
                    ? 'hover:bg-neutral-100 hover:scale-105 active:scale-95 shadow-sm'
                    : 'opacity-40 cursor-not-allowed'
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Slider Track */}
        <div
          ref={sliderRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={displayHeading}
          onScroll={updateScrollState}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-2 pb-6',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl',
            'scrollbar-none'
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedProducts.map((product, idx) => (
            <div
              key={product.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${displayedProducts.length}`}
              className="w-[78vw] sm:w-[45vw] md:w-[32vw] lg:w-[23vw] flex-shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                cardStyle={storeConfig?.theme?.shape?.cardStyle}
                borderRadius={storeConfig?.theme?.shape?.borderRadius}
              />
            </div>
          ))}
        </div>

        {/* Optional Dots Pagination */}
        {showDots && (
          <div className="flex justify-center items-center gap-2 mt-4" role="tablist" aria-label="Slides">
            {displayedProducts.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => scrollToSlide(idx)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  idx === activeIndex
                    ? 'w-6 bg-[var(--color-primary,#111827)]'
                    : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCarousel;
