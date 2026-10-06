import React from 'react';
import { HeroStandardSettings } from '../../types/section';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { cn } from '../../utils/cn';

export interface HeroStandardProps {
  id?: string;
  settings: HeroStandardSettings;
  className?: string;
}

const ALIGNMENT_MAP = {
  left: 'items-start text-left mr-auto',
  center: 'items-center text-center mx-auto',
  right: 'items-end text-right ml-auto',
};

const CTA_ALIGNMENT_MAP = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const HeroStandard: React.FC<HeroStandardProps> = ({ id, settings, className }) => {
  const {
    heading,
    subheading,
    eyebrow,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    backgroundImageUrl,
    overlayOpacity = 0.5,
    textAlignment = 'center',
    crestImageUrl,
    badgeText,
  } = settings;

  const clampedOpacity = Math.min(1, Math.max(0, overlayOpacity));
  const alignClass = ALIGNMENT_MAP[textAlignment] || ALIGNMENT_MAP.center;
  const ctaAlignClass = CTA_ALIGNMENT_MAP[textAlignment] || CTA_ALIGNMENT_MAP.center;
  const hasBgImage = Boolean(backgroundImageUrl);

  return (
    <section
      id={id}
      aria-label={heading}
      className={cn(
        'relative w-full overflow-hidden min-h-[500px] sm:min-h-[580px] lg:min-h-[660px] flex items-center justify-center',
        !hasBgImage && 'bg-[var(--color-background)] text-[var(--color-text)]',
        className
      )}
    >
      {/* Background Image & Overlay */}
      {hasBgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ImageWithFallback
            src={backgroundImageUrl}
            alt={heading}
            aspectRatio="auto"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
            showSkeleton={false}
          />
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: clampedOpacity }}
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col">
        <div className={cn('flex flex-col max-w-3xl', alignClass)}>
          {/* Optional Crest / Insignia */}
          {crestImageUrl && (
            <div className="mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <ImageWithFallback
                src={crestImageUrl}
                alt="Brand crest"
                aspectRatio="square"
                containerClassName="w-full h-full bg-transparent"
                className="w-full h-full object-contain"
                showSkeleton={false}
              />
            </div>
          )}

          {/* Optional Badge */}
          {badgeText && (
            <div className="mb-3 sm:mb-4">
              <Badge
                variant="outline"
                size="md"
                className={cn(
                  'border-[var(--color-accent,#C5A059)] tracking-widest uppercase font-mono text-[10px] sm:text-xs',
                  hasBgImage && 'bg-black/40 text-white backdrop-blur-sm'
                )}
              >
                {badgeText}
              </Badge>
            </div>
          )}

          {/* Eyebrow */}
          {eyebrow && (
            <p
              className={cn(
                'font-body text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3',
                hasBgImage ? 'text-neutral-200' : 'text-[var(--color-primary)]'
              )}
            >
              {eyebrow}
            </p>
          )}

          {/* Main Heading */}
          <h1
            className={cn(
              'font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.15]',
              hasBgImage ? 'text-white drop-shadow-sm' : 'text-[var(--color-text)]'
            )}
          >
            {heading}
          </h1>

          {/* Subheading */}
          {subheading && (
            <p
              className={cn(
                'font-body text-base sm:text-lg md:text-xl max-w-2xl mb-8 leading-relaxed font-normal',
                hasBgImage ? 'text-neutral-200 drop-shadow-sm' : 'text-[var(--color-text-muted)]'
              )}
            >
              {subheading}
            </p>
          )}

          {/* CTAs */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className={cn('flex flex-wrap items-center gap-3 sm:gap-4 w-full', ctaAlignClass)}>
              {primaryCtaText && (
                <a
                  href={primaryCtaLink || '#'}
                  className="inline-block no-underline focus:outline-none"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="min-w-[150px] shadow-md"
                  >
                    {primaryCtaText}
                  </Button>
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink || '#'}
                  className="inline-block no-underline focus:outline-none"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      'min-w-[150px]',
                      hasBgImage && 'bg-black/30 text-white border-white/60 hover:bg-white/10'
                    )}
                  >
                    {secondaryCtaText}
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroStandard;
