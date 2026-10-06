import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CollectionCardsSettings } from '../../types/section';
import { useStore } from '../../engine/StoreContext';
import { Badge } from '../../components/common/Badge';
import { ImageWithFallback, ImageCategory } from '../../components/common/ImageWithFallback';
import { cn } from '../../utils/cn';

export interface CollectionCardsProps {
  settings: CollectionCardsSettings;
  id?: string;
  className?: string;
}

const COLUMN_GRID_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto',
};

const ASPECT_RATIO_CLASSES: Record<'square' | 'portrait' | 'landscape', string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/9]',
};

export const CollectionCards: React.FC<CollectionCardsProps> = ({
  settings,
  id,
  className,
}) => {
  let storeId = 'coffee';
  let storeConfig: ReturnType<typeof useStore>['storeConfig'] | undefined;

  try {
    const store = useStore();
    storeId = store.storeId;
    storeConfig = store.storeConfig;
  } catch {
    // Fallback when outside StoreProvider
  }

  const displayHeading =
    settings.heading ||
    (settings as unknown as { title?: string }).title;

  const columns = settings.columns || 3;
  const aspectRatio = settings.aspectRatio || 'square';

  const contentDensity = storeConfig?.theme?.layout?.contentDensity || 'comfortable';
  const densityPadding =
    contentDensity === 'spacious'
      ? 'py-16 md:py-24'
      : contentDensity === 'dense'
      ? 'py-8 md:py-12'
      : 'py-12 md:py-16';

  const collections = settings.collections || [];

  return (
    <section
      id={id}
      className={cn('w-full px-4 sm:px-6 lg:px-8', densityPadding, className)}
      aria-label={displayHeading || 'Featured Collections'}
    >
      <div className="max-w-7xl mx-auto">
        {/* Optional Section Header */}
        {(displayHeading || settings.subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            {settings.subheading && (
              <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-[var(--color-primary,#111827)] mb-1.5">
                {settings.subheading}
              </p>
            )}
            {displayHeading && (
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text,#111827)]">
                {displayHeading}
              </h2>
            )}
          </div>
        )}

        {/* Collection Cards Grid */}
        <div className={cn('grid gap-4 sm:gap-6', COLUMN_GRID_CLASSES[columns])}>
          {collections.map((item) => (
            <Link
              key={item.handle}
              to={`/${storeId}/collections/${item.handle}`}
              className={cn(
                'group relative block overflow-hidden rounded-[var(--radius-card,0.75rem)]',
                'border border-transparent hover:border-[var(--color-border,#e5e7eb)] shadow-sm hover:shadow-xl transition-all duration-500',
                ASPECT_RATIO_CLASSES[aspectRatio]
              )}
            >
              {/* Background Collection Image */}
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.title}
                aspectRatio="auto"
                fallbackCategory={(storeConfig?.industry as ImageCategory) || 'general'}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                containerClassName="absolute inset-0 w-full h-full"
              />

              {/* Scrim Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

              {/* Overlay Content */}
              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end text-white z-10">
                {item.itemCountText && (
                  <Badge
                    variant="outline"
                    size="sm"
                    className="w-fit mb-2.5 bg-black/40 backdrop-blur-md border-white/25 text-white text-[11px]"
                  >
                    {item.itemCountText}
                  </Badge>
                )}

                <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight mb-1">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs sm:text-sm text-neutral-200 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-white/90 group-hover:text-white group-hover:underline underline-offset-4">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionCards;
