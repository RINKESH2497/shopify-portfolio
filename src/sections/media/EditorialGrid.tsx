import React from 'react';
import { EditorialGridSettings, EditorialGridItem } from '../../types/section';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { cn } from '../../utils/cn';

export interface EditorialGridProps {
  id?: string;
  settings: EditorialGridSettings;
  className?: string;
}

/**
 * Static mapping ensures Tailwind compiles all span variations safely.
 */
const SPAN_CLASSES: Record<NonNullable<EditorialGridItem['span']>, string> = {
  'col-span-1': 'col-span-1',
  'col-span-2': 'col-span-1 md:col-span-2',
  'col-span-3': 'col-span-1 md:col-span-2 lg:col-span-3',
  'row-span-2': 'col-span-1 row-span-1 lg:row-span-2',
};

export const EditorialGrid: React.FC<EditorialGridProps> = ({ id, settings, className }) => {
  const { heading, subheading, items } = settings;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      aria-label={heading || 'Editorial Showcase'}
      className={cn(
        'w-full py-16 sm:py-20 md:py-28 bg-[var(--color-background)] text-[var(--color-text)]',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {(heading || subheading) && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            {heading && (
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="font-body text-base sm:text-lg text-[var(--color-text-muted)]">
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Asymmetrical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[280px] sm:auto-rows-[340px] lg:auto-rows-[400px]">
          {items.map((item, index) => {
            const spanClass = item.span ? SPAN_CLASSES[item.span] : 'col-span-1';

            const CardContent = (
              <div
                className={cn(
                  'relative h-full w-full group overflow-hidden rounded-[var(--radius-card,var(--theme-radius,0.5rem))] border border-[var(--color-border)] shadow-md bg-neutral-900',
                  spanClass
                )}
              >
                {/* Image */}
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.title}
                  aspectRatio="auto"
                  fallbackCategory="fashion"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-90 pointer-events-none" />

                {/* Text Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col justify-end text-white pointer-events-none">
                  {item.subtitle && (
                    <p className="font-body text-xs sm:text-sm font-medium uppercase tracking-widest text-neutral-300 mb-2">
                      {item.subtitle}
                    </p>
                  )}
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold leading-snug group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>
            );

            if (item.link) {
              return (
                <a
                  key={index}
                  href={item.link}
                  className={cn('block no-underline focus:outline-none', spanClass)}
                  aria-label={item.title}
                >
                  {CardContent}
                </a>
              );
            }

            return (
              <div key={index} className={spanClass}>
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EditorialGrid;
