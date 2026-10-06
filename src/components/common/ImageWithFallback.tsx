import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export type ImageCategory = 'coffee' | 'fashion' | 'jewelry' | 'electronics' | 'general';
export type AspectRatioType = 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackCategory?: ImageCategory;
  customFallbackSrc?: string;
  aspectRatio?: AspectRatioType;
  containerClassName?: string;
  showSkeleton?: boolean;
}

const ASPECT_RATIO_CLASSES: Record<AspectRatioType, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  auto: '',
};

/**
 * Category-specific inline SVG vector paths and icons for zero-network fallback.
 */
function renderCategoryVector(category: ImageCategory) {
  switch (category) {
    case 'coffee':
      return (
        <svg viewBox="0 0 64 64" className="w-16 h-16 text-amber-700/60" fill="currentColor">
          <path d="M46 22H14c-1.1 0-2 .9-2 2v18c0 7.7 6.3 14 14 14h8c7.7 0 14-6.3 14-14v-2h2c5.5 0 10-4.5 10-10s-4.5-10-10-10h-4v2zm4 8h2c2.2 0 4 1.8 4 4s-1.8 4-4 4h-2V30zM20 10c0-2.2 1.8-4 4-4s4 1.8 4 4v4h-8v-4zm12 0c0-2.2 1.8-4 4-4s4 1.8 4 4v4h-8v-4z" />
        </svg>
      );
    case 'fashion':
      return (
        <svg
          viewBox="0 0 64 64"
          className="w-16 h-16 text-neutral-600/60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="32" cy="14" r="5" />
          <path d="M32 19v5l-20 12h40L32 24" />
          <path d="M12 36l8 22h24l8-22" />
        </svg>
      );
    case 'jewelry':
      return (
        <svg
          viewBox="0 0 64 64"
          className="w-16 h-16 text-amber-500/60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="18,16 46,16 56,28 32,54 8,28" />
          <polyline points="8,28 32,16 56,28" />
          <line x1="32" y1="54" x2="32" y2="16" />
        </svg>
      );
    case 'electronics':
      return (
        <svg
          viewBox="0 0 64 64"
          className="w-16 h-16 text-cyan-600/60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="14" y="14" width="36" height="36" rx="6" />
          <circle cx="32" cy="32" r="6" />
          <path d="M22 6v8M32 6v8M42 6v8M22 50v8M32 50v8M42 50v8M6 22h8M6 32h8M6 42h8M50 22h8M50 32h8M50 42h8" />
        </svg>
      );
    case 'general':
    default:
      return (
        <svg
          viewBox="0 0 64 64"
          className="w-16 h-16 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="12" width="48" height="40" rx="4" />
          <circle cx="22" cy="24" r="4" />
          <path d="M56 42l-14-14-22 22" />
        </svg>
      );
  }
}

/**
 * Resilient image component with loading skeleton and inline SVG fallback.
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackCategory = 'general',
  customFallbackSrc,
  aspectRatio = 'square',
  containerClassName,
  className,
  loading = 'lazy',
  showSkeleton = true,
  ...restProps
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Reset state if src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const ratioClass = ASPECT_RATIO_CLASSES[aspectRatio];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-900',
        ratioClass,
        containerClassName
      )}
    >
      {/* Loading Skeleton */}
      {isLoading && showSkeleton && !hasError && (
        <div
          className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-800 z-10"
          aria-hidden="true"
        />
      )}

      {/* Fallback View */}
      {hasError ? (
        customFallbackSrc ? (
          <img
            src={customFallbackSrc}
            alt={alt}
            className={cn('w-full h-full object-cover', className)}
            loading={loading}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full h-full p-4 text-center bg-neutral-100 dark:bg-neutral-800/80"
            role="img"
            aria-label={alt}
          >
            {renderCategoryVector(fallbackCategory)}
            <span className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-[85%]">
              {alt || 'Product preview unavailable'}
            </span>
          </div>
        )
      ) : (
        /* Native Image */
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          {...restProps}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
