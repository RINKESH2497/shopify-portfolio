import React, { useId } from 'react';
import { ExternalLink } from 'lucide-react';
import { LogoCloudSettings, LogoItem } from '../../types/section';
import { cn } from '../../utils/cn';

export interface LogoCloudProps {
  settings: LogoCloudSettings;
  id?: string;
  className?: string;
}

export const LogoCloud: React.FC<LogoCloudProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading,
    logos = [],
    grayscale = true,
    layout = 'row',
  } = settings;

  const sectionId = id || useId();

  if (logos.length === 0) return null;

  const renderLogo = (item: LogoItem, idx: number) => {
    const content = (
      <div className="flex flex-col items-center justify-center p-3 text-center">
        {item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.name}
            loading="lazy"
            className="h-8 sm:h-9 md:h-11 w-auto max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Graceful error fallback to typographic wordmark if image fails
              e.currentTarget.style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling;
              if (sibling) (sibling as HTMLElement).style.display = 'block';
            }}
          />
        ) : null}

        {/* Fallback wordmark styled with heading font */}
        <span
          className={cn(
            'font-heading font-bold tracking-wider text-sm sm:text-base md:text-lg select-none uppercase',
            item.logoUrl ? 'hidden' : 'block',
            'text-[var(--color-text,#111827)]'
          )}
        >
          {item.name}
        </span>

        {item.quote && (
          <span className="block mt-2 text-[11px] text-[var(--color-text-muted,#6b7280)] italic max-w-[180px] line-clamp-2">
            &ldquo;{item.quote}&rdquo;
          </span>
        )}
      </div>
    );

    const wrapperClass = cn(
      'group relative flex items-center justify-center transition-all duration-300',
      grayscale
        ? 'filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
        : 'opacity-80 hover:opacity-100'
    );

    if (item.externalUrl) {
      return (
        <a
          key={`${item.name}-${idx}`}
          href={item.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${item.name} (opens in new tab)`}
          className={cn(wrapperClass, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#111827)] rounded-md')}
        >
          {content}
          <ExternalLink className="w-3 h-3 text-[var(--color-text-muted,#6b7280)] opacity-0 group-hover:opacity-100 transition-opacity ml-1 absolute top-1 right-1" />
        </a>
      );
    }

    return (
      <div key={`${item.name}-${idx}`} className={wrapperClass}>
        {content}
      </div>
    );
  };

  return (
    <section
      id={sectionId}
      data-section-type="logo-cloud"
      className={cn('w-full py-10 md:py-16 px-4 sm:px-6 lg:px-8 border-y border-[var(--color-border,#e5e7eb)]', className)}
    >
      <div className="max-w-7xl mx-auto">
        {heading && (
          <p className="font-heading text-xs sm:text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted,#6b7280)] text-center mb-8 sm:mb-10">
            {heading}
          </p>
        )}

        {layout === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 items-center justify-items-center">
            {logos.map(renderLogo)}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {logos.map(renderLogo)}
          </div>
        )}
      </div>
    </section>
  );
};

export default LogoCloud;
