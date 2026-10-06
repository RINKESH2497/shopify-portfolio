import React, { useId, useMemo } from 'react';
import { MarqueeSettings } from '../../types/section';
import { cn } from '../../utils/cn';

export interface MarqueeProps {
  settings: MarqueeSettings;
  id?: string;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    items = [],
    speed = 'normal',
    direction = 'left',
    pauseOnHover = true,
    separator = '✦',
    backgroundColor,
    textColor,
  } = settings;

  const sectionId = id || useId();

  if (items.length === 0) return null;

  // Duration mapping based on speed configuration
  const durationStyle = useMemo(() => {
    switch (speed) {
      case 'slow':
        return '45s';
      case 'fast':
        return '14s';
      case 'normal':
      default:
        return '25s';
    }
  }, [speed]);

  // Repeat items so short arrays fully fill the ticker track
  const repeatedItems = useMemo(() => {
    if (items.length >= 6) return items;
    const copies = Math.ceil(6 / items.length);
    return Array.from({ length: copies }).flatMap(() => items);
  }, [items]);

  const customStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || 'var(--color-primary, #111827)',
    color: textColor || 'var(--color-text-inverse, #ffffff)',
  };

  const animationStyle: React.CSSProperties = {
    animationDuration: durationStyle,
    animationDirection: direction === 'right' ? 'reverse' : 'normal',
  };

  return (
    <section
      id={sectionId}
      data-section-type="marquee"
      style={customStyle}
      role="region"
      aria-label="Announcement ticker"
      className={cn(
        'group relative w-full overflow-hidden py-3 sm:py-4 select-none',
        className
      )}
    >
      <div className="flex w-max items-center">
        {/* Track Half A */}
        <div
          className={cn(
            'flex items-center shrink-0 animate-marquee',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            'motion-reduce:animate-none'
          )}
          style={animationStyle}
        >
          {repeatedItems.map((item, index) => (
            <div key={`a-${index}`} className="flex items-center shrink-0">
              <span className="font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider px-4">
                {item}
              </span>
              <span className="opacity-40 text-xs px-2" aria-hidden="true">
                {separator}
              </span>
            </div>
          ))}
        </div>

        {/* Track Half B (Duplicated for seamless -50% continuous loop, marked aria-hidden for screen readers) */}
        <div
          aria-hidden="true"
          className={cn(
            'flex items-center shrink-0 animate-marquee',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            'motion-reduce:animate-none'
          )}
          style={animationStyle}
        >
          {repeatedItems.map((item, index) => (
            <div key={`b-${index}`} className="flex items-center shrink-0">
              <span className="font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider px-4">
                {item}
              </span>
              <span className="opacity-40 text-xs px-2" aria-hidden="true">
                {separator}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;
