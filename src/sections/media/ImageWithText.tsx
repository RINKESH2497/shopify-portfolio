import React from 'react';
import { ImageWithTextSettings } from '../../types/section';
import { Button } from '../../components/common/Button';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { cn } from '../../utils/cn';

export interface ImageWithTextProps {
  id?: string;
  settings: ImageWithTextSettings;
  className?: string;
}

export const ImageWithText: React.FC<ImageWithTextProps> = ({ id, settings, className }) => {
  const {
    heading,
    content,
    eyebrow,
    imageUrl,
    imageAlt,
    imagePosition = 'left',
    ctaText,
    ctaLink,
    statHighlight,
  } = settings;

  const isImageLeft = imagePosition === 'left';

  return (
    <section
      id={id}
      aria-label={heading}
      className={cn(
        'w-full py-16 sm:py-20 md:py-28 bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Media Column */}
          <div
            className={cn(
              'relative order-2',
              isImageLeft ? 'lg:order-1' : 'lg:order-2'
            )}
          >
            <div className="relative overflow-hidden rounded-[var(--radius-card,var(--theme-radius,0.75rem))] border border-[var(--color-border)] shadow-md group bg-[var(--color-surface)]">
              <ImageWithFallback
                src={imageUrl}
                alt={imageAlt || heading}
                aspectRatio="landscape"
                fallbackCategory="coffee"
                containerClassName="w-full aspect-[4/3]"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Text Content Column */}
          <div
            className={cn(
              'flex flex-col justify-center order-1',
              isImageLeft ? 'lg:order-2' : 'lg:order-1'
            )}
          >
            {eyebrow && (
              <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest uppercase text-[var(--color-accent,#8B5A2B)] mb-3 font-body">
                {eyebrow}
              </span>
            )}

            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text)] mb-5 leading-[1.2]">
              {heading}
            </h2>

            <p className="font-body text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed mb-6">
              {content}
            </p>

            {/* Optional Stat Highlight Card */}
            {statHighlight && (
              <div className="mb-8 p-4 sm:p-5 rounded-[var(--radius-card,0.5rem)] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-4 shadow-sm">
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--color-primary)] shrink-0">
                  {statHighlight.value}
                </div>
                <div className="font-body text-xs sm:text-sm text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                  {statHighlight.label}
                </div>
              </div>
            )}

            {/* CTA */}
            {ctaText && (
              <div>
                <a href={ctaLink || '#'} className="inline-block no-underline">
                  <Button variant="primary" size="md">
                    {ctaText}
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageWithText;
