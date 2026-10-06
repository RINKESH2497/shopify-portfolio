import React, { useCallback } from 'react';
import { HeroFullscreenSettings } from '../../types/section';
import { Button } from '../../components/common/Button';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { cn } from '../../utils/cn';

export interface HeroFullscreenProps {
  id?: string;
  settings: HeroFullscreenSettings;
  className?: string;
}

const POSITION_MAP = {
  center: 'justify-center items-center text-center',
  'bottom-left': 'justify-end items-start text-left pb-16 sm:pb-24 lg:pb-32',
  'bottom-center': 'justify-end items-center text-center pb-16 sm:pb-24 lg:pb-32',
};

export const HeroFullscreen: React.FC<HeroFullscreenProps> = ({ id, settings, className }) => {
  const {
    heading,
    subheading,
    eyebrow,
    primaryCtaText,
    primaryCtaLink,
    mediaUrl,
    mediaType = 'image',
    overlayOpacity = 0.4,
    textPosition = 'center',
    scrollIndicator = true,
  } = settings;

  const clampedOpacity = Math.min(1, Math.max(0, overlayOpacity));
  const positionClass = POSITION_MAP[textPosition] || POSITION_MAP.center;
  const isVideo = mediaType === 'video';

  const handleScrollDown = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }
  }, []);

  return (
    <section
      id={id}
      aria-label={heading}
      className={cn(
        'relative w-full h-screen min-h-[600px] overflow-hidden flex flex-col justify-between bg-black text-white select-none',
        className
      )}
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isVideo ? (
          <video
            src={mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <ImageWithFallback
            src={mediaUrl}
            alt={heading}
            aspectRatio="auto"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
            showSkeleton={false}
          />
        )}
        {/* Tinted Dimming Overlay */}
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
          style={{ opacity: clampedOpacity }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 flex-1 flex flex-col">
        <div className={cn('w-full flex-1 flex flex-col', positionClass)}>
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="font-body text-xs sm:text-sm uppercase tracking-[0.25em] text-neutral-300 font-medium mb-3">
                {eyebrow}
              </p>
            )}

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight uppercase leading-[0.95] mb-5 drop-shadow-md">
              {heading}
            </h1>

            {subheading && (
              <p className="font-body text-base sm:text-lg md:text-xl text-neutral-200 leading-relaxed mb-8 font-light drop-shadow-md max-w-2xl">
                {subheading}
              </p>
            )}

            {primaryCtaText && (
              <div
                className={cn(
                  'flex items-center gap-4',
                  textPosition === 'center' || textPosition === 'bottom-center'
                    ? 'justify-center'
                    : 'justify-start'
                )}
              >
                <a href={primaryCtaLink || '#'} className="inline-block no-underline">
                  <Button
                    variant="primary"
                    size="lg"
                    className="min-w-[180px] bg-white text-black hover:bg-neutral-200 border-none shadow-xl tracking-wider font-semibold"
                  >
                    {primaryCtaText}
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {scrollIndicator && (
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll to content"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 cursor-pointer text-white/70 hover:text-white transition-colors duration-300 focus:outline-none"
        >
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-300">
            Scroll
          </span>
          <div className="w-5 h-8 rounded-full border border-white/50 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
          </div>
        </button>
      )}
    </section>
  );
};

export default HeroFullscreen;
