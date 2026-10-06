import React, { useState, useEffect, useCallback, useId } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { TestimonialsSettings, TestimonialItem } from '../../types/section';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export interface TestimonialsProps {
  settings: TestimonialsSettings;
  id?: string;
  className?: string;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading = 'What Our Customers Say',
    subheading,
    testimonials = [],
    layout = 'grid',
  } = settings;

  const sectionId = id || useId();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const total = testimonials.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay in carousel mode (pauses on hover)
  useEffect(() => {
    if (layout !== 'carousel' || total <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [layout, total, isPaused, nextSlide]);

  if (total === 0) return null;

  // Touch handlers for carousel swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    setTouchStart(null);
  };

  const renderCard = (item: TestimonialItem) => {
    const rating = Math.min(Math.max(item.rating ?? 5, 1), 5);
    const initials = item.author
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div
        key={item.id}
        className={cn(
          'relative flex flex-col justify-between p-6 sm:p-8',
          'bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)]',
          'rounded-[var(--radius-card,0.75rem)] shadow-sm hover:shadow-md transition-shadow duration-300'
        )}
      >
        <Quote
          className="absolute top-6 right-6 w-8 h-8 text-[var(--color-text-muted,#6b7280)] opacity-15 pointer-events-none"
          aria-hidden="true"
        />

        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-4" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-300 dark:text-neutral-700'
                )}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Quote Body */}
          <p className="font-body text-base sm:text-lg text-[var(--color-text,#111827)] italic leading-relaxed mb-6">
            &ldquo;{item.quote}&rdquo;
          </p>
        </div>

        {/* Author Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border,#e5e7eb)]">
          {item.avatarUrl ? (
            <ImageWithFallback
              src={item.avatarUrl}
              alt={item.author}
              aspectRatio="square"
              className="w-11 h-11 rounded-full object-cover shrink-0"
              containerClassName="w-11 h-11 rounded-full shrink-0"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full bg-[var(--color-primary-light,#f3f4f6)] text-[var(--color-primary,#111827)] font-semibold flex items-center justify-center text-sm shrink-0"
              aria-hidden="true"
            >
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base text-[var(--color-text,#111827)] truncate">
              {item.author}
            </h4>
            {item.roleOrLocation && (
              <p className="text-xs text-[var(--color-text-muted,#6b7280)] truncate">
                {item.roleOrLocation}
              </p>
            )}
            {item.productReferenced && (
              <Badge variant="outline" size="sm" className="mt-1 text-[10px]">
                {item.productReferenced}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id={sectionId}
      data-section-type="testimonials"
      className={cn('w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8', className)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            {heading && (
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text,#111827)] tracking-tight">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="font-body text-base sm:text-lg text-[var(--color-text-muted,#6b7280)] mt-3">
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Grid Layout */}
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map(renderCard)}
          </div>
        ) : (
          /* Carousel Layout */
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer Testimonials Carousel"
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((item, idx) => (
                  <div
                    key={item.id}
                    className="w-full shrink-0 px-2 sm:px-4"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${idx + 1} of ${total}`}
                  >
                    <div className="max-w-2xl mx-auto">{renderCard(item)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation Buttons */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous testimonial"
                  className={cn(
                    'absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-10',
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    'bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] shadow-md',
                    'text-[var(--color-text,#111827)] hover:bg-neutral-100 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#111827)]'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next testimonial"
                  className={cn(
                    'absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-10',
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    'bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] shadow-md',
                    'text-[var(--color-text,#111827)] hover:bg-neutral-100 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#111827)]'
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      aria-current={currentIndex === idx ? 'true' : 'false'}
                      className={cn(
                        'h-2.5 rounded-full transition-all duration-300',
                        currentIndex === idx
                          ? 'w-8 bg-[var(--color-primary,#111827)]'
                          : 'w-2.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
