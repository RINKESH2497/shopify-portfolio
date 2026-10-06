import React from 'react';
import { HeroSplitSettings } from '../../types/section';
import { Button } from '../../components/common/Button';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { useStore } from '../../engine/StoreContext';
import { cn } from '../../utils/cn';

export interface HeroSplitProps {
  id?: string;
  settings: HeroSplitSettings;
  className?: string;
}

export const HeroSplit: React.FC<HeroSplitProps> = ({ id, settings, className }) => {
  const {
    heading,
    subheading,
    tagline,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    imageUrl,
    imageAlt,
    imagePosition = 'right',
    featuredProductId,
    stats,
  } = settings;

  let storeId = 'coffee';
  try {
    const store = useStore();
    if (store?.storeId) storeId = store.storeId;
  } catch {
    // Standalone fallback without StoreContext
  }

  const isImageLeft = imagePosition === 'left';

  return (
    <section
      id={id}
      aria-label={heading}
      className={cn(
        'w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content Column */}
          <div
            className={cn(
              'flex flex-col justify-center order-1',
              isImageLeft ? 'lg:order-2' : 'lg:order-1'
            )}
          >
            {tagline && (
              <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest uppercase text-[var(--color-primary)] font-body mb-3">
                {tagline}
              </span>
            )}

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-text)] leading-[1.15] mb-5">
              {heading}
            </h1>

            {subheading && (
              <p className="font-body text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed mb-8 max-w-xl">
                {subheading}
              </p>
            )}

            {/* CTAs */}
            {(primaryCtaText || secondaryCtaText) && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
                {primaryCtaText && (
                  <a href={primaryCtaLink || '#'} className="inline-block no-underline">
                    <Button variant="primary" size="lg" className="min-w-[150px]">
                      {primaryCtaText}
                    </Button>
                  </a>
                )}
                {secondaryCtaText && (
                  <a href={secondaryCtaLink || '#'} className="inline-block no-underline">
                    <Button variant="outline" size="lg" className="min-w-[150px]">
                      {secondaryCtaText}
                    </Button>
                  </a>
                )}
              </div>
            )}

            {/* Stats Display */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-[var(--color-border)]">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
                      {stat.value}
                    </span>
                    <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Column */}
          <div
            className={cn(
              'relative order-2',
              isImageLeft ? 'lg:order-1' : 'lg:order-2'
            )}
          >
            <div className="relative group overflow-hidden rounded-[var(--radius-card,var(--theme-radius,1rem))] border border-[var(--color-border)] shadow-lg bg-[var(--color-surface)]">
              <ImageWithFallback
                src={imageUrl}
                alt={imageAlt || heading}
                aspectRatio="portrait"
                fallbackCategory="coffee"
                containerClassName="w-full aspect-[4/5] max-h-[600px]"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Optional Featured Product Overlay */}
              {featuredProductId && (
                <div className="absolute bottom-4 left-4 right-4 bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] p-3.5 rounded-[var(--radius-btn,0.5rem)] shadow-lg flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-text-muted)]">
                      Featured Reserve
                    </span>
                    <span className="text-xs sm:text-sm font-heading font-semibold text-[var(--color-text)] truncate">
                      {imageAlt || 'Selected Product'}
                    </span>
                  </div>
                  <a
                    href={`/${storeId}/products/${featuredProductId}`}
                    className="shrink-0 text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    View Details &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;
