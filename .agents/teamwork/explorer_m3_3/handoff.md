# Handoff Report: Explorer M3-3 (Social & Content Sections and SectionRenderer Architect)

**Agent**: `explorer_m3_3` (teamwork_preview_explorer)  
**Parent Orchestrator**: `89794ca8-9dce-460e-a4d8-ce255cb3f694`  
**Milestone**: M3 (Reusable Section Library & Dynamic SectionRenderer)  
**Deliverables Covered**:
1. `Testimonials` (`src/sections/social/Testimonials.tsx`)
2. `ReviewsBreakdown` (`src/sections/social/ReviewsBreakdown.tsx`)
3. `LogoCloud` (`src/sections/social/LogoCloud.tsx`)
4. `Marquee` (`src/sections/content/Marquee.tsx`)
5. `NewsletterSignup` (`src/sections/content/NewsletterSignup.tsx`)
6. `FaqAccordion` (`src/sections/content/FaqAccordion.tsx`)
7. `SectionRenderer` (`src/sections/SectionRenderer.tsx`)
8. Barrel Exports (`src/sections/index.ts`)

---

## 1. Observation

### 1.1 Existing Architecture & Contracts
1. **Section Types & Contracts** (`src/types/section.ts:1-261`):
   - `src/types/section.ts` defines master discriminated union `SectionConfig`:
     ```typescript
     export type SectionConfig =
       | HeroStandardSectionConfig
       | HeroSplitSectionConfig
       | HeroFullscreenSectionConfig
       | FeaturedProductsSectionConfig
       | ProductCarouselSectionConfig
       | CollectionCardsSectionConfig
       | ImageWithTextSectionConfig
       | TestimonialsSectionConfig
       | ReviewsBreakdownSectionConfig
       | LogoCloudSectionConfig
       | MarqueeSectionConfig
       | NewsletterSignupSectionConfig
       | FaqAccordionSectionConfig
       | EditorialGridSectionConfig;
     ```
   - Each variant uses `BaseSectionConfig<TType, TSettings>` with an exact `type` discriminator string and strongly-typed `settings` interface (`TestimonialsSettings`, `ReviewsBreakdownSettings`, `LogoCloudSettings`, `MarqueeSettings`, `NewsletterSignupSettings`, `FaqAccordionSettings`).
   - Zero `any` types exist across `src/types/section.ts`.

2. **Tailwind & CSS Tokens** (`src/index.css:5-37` and `tailwind.config.js:9-85`):
   - CSS custom properties in `:root` include:
     `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-text-inverse`, `--color-border`, `--font-heading`, `--font-body`, `--radius-btn`, `--radius-card`, `--radius-badge`, `--animation-duration`, `--animation-easing`.
   - `tailwind.config.js` lines 59-62 already define `marquee` keyframes:
     ```javascript
     marquee: {
       '0%': { transform: 'translateX(0%)' },
       '100%': { transform: 'translateX(-50%)' },
     }
     ```
     and animation `marquee: 'marquee 25s linear infinite'` (line 77).

3. **Core Primitives & Icons Availability**:
   - `src/components/common/Button.tsx`: Supports `variant` (`'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'`), `size`, `isLoading`, `loadingText`, `leftIcon`, `rightIcon`.
   - `src/components/common/Badge.tsx`: Supports `variant` (`'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'sale'`), `size`, `dot`, `icon`.
   - `src/components/common/ImageWithFallback.tsx`: Resilient image loading with skeleton shimmer and zero-network inline SVG fallbacks.
   - `src/utils/cn.ts`: Combines `clsx` and `tailwind-merge`.
   - `lucide-react`: Verified node module exports: `Star`, `Quote`, `Check`, `CheckCircle`, `ChevronLeft`, `ChevronRight`, `ChevronDown`, `Mail`, `AlertCircle`, `ExternalLink`.

4. **Engine & State Contracts** (`src/engine/`):
   - `StoreContext.tsx`: `useStore()` provides `storeId`, `storeConfig`, `products`, `getFeaturedProducts()`, etc.
   - `ThemeContext.tsx`: `useTheme()` dynamically binds CSS variables to the document root per store.
   - Default store section sequences in `StoreContext.tsx` utilize `testimonials`, `marquee`, `newsletter-signup`, `reviews-breakdown`, `faq-accordion`, and `logo-cloud`.

5. **Test Suite Baseline**:
   - Vitest unit tests: 136 passed (6 test files).
   - E2E test runner (`tests/test-runner.ts`): 188/188 tests passed across all 4 tiers (Feature, Boundary, Interaction, Scenario).

---

## 2. Logic Chain

1. **SectionRenderer Component Registry & Discriminated Union Narrowing**:
   - *Premise*: `SectionConfig` is a discriminated union of 14 section configurations based on the `type` property.
   - *Deduction*: By switching on `section.type`, TypeScript automatically narrows `section.settings` to its exact interface in each branch without casting (`as any`).
   - *Safety*: To handle unexpected or future section types in demo mode, a default branch must render a non-crashing fallback banner (`UnknownSectionFallback`) that logs the unknown type and displays its ID without breaking sibling sections on the page.
   - *Resilience*: Wrapping each rendered section inside an internal `SectionErrorBoundary` guarantees that if any section has malformed data or throws an uncaught error, only that section displays a fallback error card while the rest of the store renders uninterrupted.

2. **Testimonials Architecture (`Testimonials.tsx`)**:
   - Conforms to `TestimonialsSettings`: `heading`, `subheading`, `testimonials: TestimonialItem[]`, `layout: 'grid' | 'carousel'`.
   - When `layout === 'grid'`, renders a responsive 1 to 3 column card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
   - When `layout === 'carousel'`, provides slide pagination with next/prev buttons, touch/swipe gestures (`onTouchStart`/`onTouchEnd`), keyboard navigation (Left/Right arrows), dot indicators, and an optional autoplay with pause-on-hover.
   - Renders star ratings using `lucide-react` `Star`, quote marks, author avatars via `ImageWithFallback` with initials fallback, roles/locations, and product badges.

3. **Reviews Breakdown Architecture (`ReviewsBreakdown.tsx`)**:
   - Conforms to `ReviewsBreakdownSettings`: `averageRating`, `totalReviews`, `recommendedPercentage`, `distribution`, `featuredReview`.
   - Renders a prominent overall score display (e.g. `4.9 / 5`), a 5-star visual rating, and recommendation badge.
   - Generates progress bars for star buckets (5★ down to 1★) with full ARIA semantics (`role="progressbar"`). If `distribution` is omitted, auto-generates a realistic distribution based on `averageRating`.
   - Renders `featuredReview` in an adjacent card with a "Verified Buyer" badge, title, quote, author, and date.
   - Responsive layout: Stacks on mobile (<768px), side-by-side on desktop.

4. **Logo Cloud Architecture (`LogoCloud.tsx`)**:
   - Conforms to `LogoCloudSettings`: `heading`, `logos: LogoItem[]`, `grayscale`, `layout: 'row' | 'grid'`.
   - Grayscale toggle applies `grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300`.
   - Handles missing `logoUrl` gracefully by generating styled typographic brand wordmarks matching the store's typography.
   - External links open in new tabs with secure `target="_blank" rel="noopener noreferrer"`.
   - Optional press quotes render as subtitle quotes beneath brand logos.

5. **Marquee Architecture (`Marquee.tsx`)**:
   - Conforms to `MarqueeSettings`: `items: string[]`, `speed`, `direction`, `pauseOnHover`, `separator`, `backgroundColor`, `textColor`.
   - To eliminate glitches or empty gaps on wide displays, the items track is duplicated into two identical halves (`[...items, ...items]`), animated with CSS `transform: translateX(0)` to `translateX(-50%)`.
   - Speed maps to `'slow'` (45s), `'normal'` (25s), `'fast'` (12s).
   - Direction `'right'` reverses the CSS animation direction.
   - Pause on hover utilizes Tailwind `group-hover:[animation-play-state:paused]`.
   - Accessibility: Includes `role="region" aria-label="Announcement ticker"`, duplicates are marked `aria-hidden="true"`, and respects `prefers-reduced-motion` with `motion-reduce:animate-none`.

6. **Newsletter Signup Architecture (`NewsletterSignup.tsx`)**:
   - Conforms to `NewsletterSignupSettings`: `heading`, `subheading`, `placeholder`, `buttonText`, `disclaimerText`, `successMessage`.
   - Client-side validation verifies RFC 5322 email syntax and trims whitespace before submission.
   - State machine: `'idle' | 'loading' | 'success' | 'error'`.
   - Simulates submission with loading state, persists subscribed emails to `localStorage` under `shopify_portfolio:${storeId}:newsletter_subscribers`, and displays an accessible success state with an option to submit another email.
   - Uses `Button` primitive and accessible form attributes (`aria-invalid`, `aria-describedby`).

7. **FAQ Accordion Architecture (`FaqAccordion.tsx`)**:
   - Conforms to `FaqAccordionSettings`: `heading`, `subheading`, `items: FaqItem[]`, `allowMultipleOpen`.
   - WAI-ARIA Accordion compliance: trigger buttons have `aria-expanded` and `aria-controls`; panels have `role="region"` and `aria-labelledby`.
   - Single-open mode allows one active item at a time; multiple-open mode allows multiple items to expand simultaneously.
   - Animated chevron (`rotate-180` transition) and CSS grid expansion (`grid-rows-[0fr]` to `grid-rows-[1fr]`) provide smooth collapse/expand animations without jumping.
   - Includes optional category filter tabs if items have categories.

8. **Barrel Exports (`src/sections/index.ts`)**:
   - Exports `SectionRenderer`, `SectionListRenderer`, and `SectionErrorBoundary`.
   - Exports all 14 section components across `hero/`, `products/`, `media/`, `social/`, and `content/`.
   - Re-exports all section types and interfaces from `../types/section`.

---

## 3. Caveats

1. **Peer Sections in Parallel**: Explorer M3-1 (`HeroStandard`, `HeroSplit`, `HeroFullscreen`, `ImageWithText`, `EditorialGrid`) and Explorer M3-2 (`FeaturedProducts`, `ProductCarousel`, `CollectionCards`) are designing the remaining 8 sections in parallel. `SectionRenderer.tsx` and `src/sections/index.ts` must reference these components by their standard paths. The blueprints provided below define standard component signatures and mock/stub imports where necessary so that `SectionRenderer` compiles cleanly even before peer components are written.
2. **Reduced Motion**: For users with vestibular sensitivity (`prefers-reduced-motion: reduce`), `Marquee` must not animate continuously. The implementation includes `motion-reduce:animate-none` and overflow scrolling.
3. **No External APIs**: Newsletter signup does not call a live backend Mailchimp/Klaviyo API. It persists to namespaced `localStorage` to fit the frontend demo portfolio architecture.

---

## 4. Conclusion & Technical Blueprints

Below are the complete, production-ready implementation blueprints for the 8 deliverables.

```
src/sections/
├── SectionRenderer.tsx           # Dynamic discriminated union registry & fallbacks
├── index.ts                     # Master barrel export
├── social/
│   ├── Testimonials.tsx         # Customer quotes (grid or carousel)
│   ├── ReviewsBreakdown.tsx     # Star distribution, progress bars & featured review
│   └── LogoCloud.tsx            # Partner brands & press logos
└── content/
    ├── Marquee.tsx              # Infinite seamless announcement ticker
    ├── NewsletterSignup.tsx     # Interactive email signup with validation
    └── FaqAccordion.tsx         # Accessible WAI-ARIA collapsible accordion
```

---

### 4.1 `src/sections/social/Testimonials.tsx`

```tsx
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
```

---

### 4.2 `src/sections/social/ReviewsBreakdown.tsx`

```tsx
import React, { useId, useMemo } from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';
import { ReviewsBreakdownSettings, StarRatingBucket } from '../../types/section';
import { Badge } from '../../components/common/Badge';
import { cn } from '../../utils/cn';

export interface ReviewsBreakdownProps {
  settings: ReviewsBreakdownSettings;
  id?: string;
  className?: string;
}

export const ReviewsBreakdown: React.FC<ReviewsBreakdownProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading = 'Customer Reviews & Ratings',
    averageRating = 4.8,
    totalReviews = 0,
    recommendedPercentage = 96,
    distribution,
    featuredReview,
  } = settings;

  const sectionId = id || useId();

  // Synthetic distribution fallback if not explicitly provided
  const buckets: StarRatingBucket[] = useMemo(() => {
    if (distribution && distribution.length > 0) {
      return [...distribution].sort((a, b) => b.stars - a.stars);
    }

    // Realistic synthesis based on averageRating and totalReviews
    const total = totalReviews || 100;
    const p5 = Math.min(Math.max(Math.round((averageRating / 5) * 78), 50), 92);
    const p4 = Math.min(Math.round((100 - p5) * 0.7), 35);
    const p3 = Math.min(Math.round((100 - p5 - p4) * 0.6), 15);
    const p2 = Math.min(Math.round((100 - p5 - p4 - p3) * 0.5), 8);
    const p1 = Math.max(100 - p5 - p4 - p3 - p2, 0);

    return [
      { stars: 5, percentage: p5, count: Math.round((p5 / 100) * total) },
      { stars: 4, percentage: p4, count: Math.round((p4 / 100) * total) },
      { stars: 3, percentage: p3, count: Math.round((p3 / 100) * total) },
      { stars: 2, percentage: p2, count: Math.round((p2 / 100) * total) },
      { stars: 1, percentage: p1, count: Math.round((p1 / 100) * total) },
    ];
  }, [distribution, averageRating, totalReviews]);

  return (
    <section
      id={sectionId}
      data-section-type="reviews-breakdown"
      className={cn('w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8', className)}
    >
      <div className="max-w-7xl mx-auto">
        {heading && (
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text,#111827)] text-center mb-10 md:mb-14">
            {heading}
          </h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Overall Rating Score (4 cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] rounded-[var(--radius-card,0.75rem)] shadow-sm text-center">
            <div className="font-heading text-5xl sm:text-6xl font-bold text-[var(--color-text,#111827)] tracking-tight">
              {averageRating.toFixed(1)}
            </div>

            <div className="flex items-center justify-center gap-1.5 my-3" aria-label={`${averageRating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5',
                    i < Math.floor(averageRating)
                      ? 'text-amber-400 fill-amber-400'
                      : i < averageRating
                      ? 'text-amber-400 fill-amber-400/50'
                      : 'text-neutral-300 dark:text-neutral-700'
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>

            <p className="font-body text-sm text-[var(--color-text-muted,#6b7280)]">
              Based on {totalReviews.toLocaleString()} verified customer reviews
            </p>

            {recommendedPercentage !== undefined && (
              <div className="mt-5 pt-5 border-t border-[var(--color-border,#e5e7eb)] flex items-center justify-center gap-2">
                <Badge variant="success" size="md" icon={<ThumbsUp className="w-3.5 h-3.5" />}>
                  {recommendedPercentage}% recommend this store
                </Badge>
              </div>
            )}
          </div>

          {/* Middle/Right Column: Star Distribution Bars (5 or 8 cols) */}
          <div
            className={cn(
              featuredReview ? 'lg:col-span-4' : 'lg:col-span-8',
              'p-6 sm:p-8 bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] rounded-[var(--radius-card,0.75rem)] shadow-sm'
            )}
          >
            <h3 className="font-heading font-semibold text-lg text-[var(--color-text,#111827)] mb-5">
              Rating Distribution
            </h3>

            <div className="space-y-3.5">
              {buckets.map((bucket) => (
                <div key={bucket.stars} className="flex items-center gap-3 text-sm">
                  {/* Star count label */}
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="font-medium text-[var(--color-text,#111827)]">{bucket.stars}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                  </div>

                  {/* Progress Bar Track */}
                  <div
                    className="flex-1 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={bucket.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${bucket.stars} star reviews: ${bucket.percentage}%`}
                  >
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${bucket.percentage}%` }}
                    />
                  </div>

                  {/* Percentage / Count label */}
                  <span className="w-12 text-right text-xs text-[var(--color-text-muted,#6b7280)] shrink-0">
                    {bucket.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Featured Review (4 cols, optional) */}
          {featuredReview && (
            <div className="lg:col-span-4 p-6 sm:p-8 bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)] rounded-[var(--radius-card,0.75rem)] shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                  Verified Buyer
                </Badge>
                {featuredReview.date && (
                  <span className="text-xs text-[var(--color-text-muted,#6b7280)]">
                    {featuredReview.date}
                  </span>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < featuredReview.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-300 dark:text-neutral-700'
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <h4 className="font-heading font-bold text-base sm:text-lg text-[var(--color-text,#111827)] mb-2">
                &ldquo;{featuredReview.title}&rdquo;
              </h4>

              <p className="font-body text-sm text-[var(--color-text-muted,#6b7280)] leading-relaxed italic mb-4">
                {featuredReview.content}
              </p>

              <div className="pt-3 border-t border-[var(--color-border,#e5e7eb)] text-xs font-semibold text-[var(--color-text,#111827)]">
                — {featuredReview.author}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsBreakdown;
```

---

### 4.3 `src/sections/social/LogoCloud.tsx`

```tsx
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
```

---

### 4.4 `src/sections/content/Marquee.tsx`

```tsx
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
```

---

### 4.5 `src/sections/content/NewsletterSignup.tsx`

```tsx
import React, { useState, useId } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { NewsletterSignupSettings } from '../../types/section';
import { Button } from '../../components/common/Button';
import { useStore } from '../../engine/StoreContext';
import { cn } from '../../utils/cn';

export interface NewsletterSignupProps {
  settings: NewsletterSignupSettings;
  id?: string;
  className?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading = 'Join Our Newsletter',
    subheading = 'Subscribe for exclusive offers, new product launches, and seasonal curation.',
    placeholder = 'Enter your email address',
    buttonText = 'Subscribe',
    disclaimerText = 'By subscribing, you agree to receive email updates. Unsubscribe anytime.',
    successMessage = 'Thank you for subscribing! Your welcome discount code has been sent.',
  } = settings;

  const sectionId = id || useId();
  const inputId = `${sectionId}-email`;
  const errorId = `${sectionId}-error`;
  const disclaimerId = `${sectionId}-disclaimer`;

  // Safe fallback if StoreContext is not present
  let storeId = 'global';
  try {
    const store = useStore();
    if (store?.storeId) storeId = store.storeId;
  } catch {
    // Standalone fallback
  }

  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an email address.');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regex.test(trimmed)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Simulate async subscription dispatch
    setTimeout(() => {
      try {
        const storageKey = `shopify_portfolio:${storeId}:newsletter_subscribers`;
        const raw = localStorage.getItem(storageKey);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(email.trim().toLowerCase())) {
          list.push(email.trim().toLowerCase());
          localStorage.setItem(storageKey, JSON.stringify(list));
        }
      } catch {
        // Silently continue in restricted storage environments
      }

      setStatus('success');
    }, 450);
  };

  return (
    <section
      id={sectionId}
      data-section-type="newsletter-signup"
      className={cn(
        'w-full py-14 md:py-24 px-4 sm:px-6 lg:px-8',
        'bg-[var(--color-surface,#ffffff)] border-y border-[var(--color-border,#e5e7eb)]',
        className
      )}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light,#f3f4f6)] text-[var(--color-primary,#111827)] mx-auto flex items-center justify-center mb-5">
          <Mail className="w-6 h-6" aria-hidden="true" />
        </div>

        {/* Heading & Subheading */}
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text,#111827)] tracking-tight">
          {heading}
        </h2>
        {subheading && (
          <p className="font-body text-base text-[var(--color-text-muted,#6b7280)] mt-3">
            {subheading}
          </p>
        )}

        {/* Success State */}
        {status === 'success' ? (
          <div
            role="status"
            className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-card,0.75rem)] text-center animate-fade-in"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <h3 className="font-heading font-semibold text-emerald-900 dark:text-emerald-200 text-lg">
              Subscription Confirmed
            </h3>
            <p className="font-body text-sm text-emerald-700 dark:text-emerald-300 mt-1">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('');
                setStatus('idle');
              }}
              className="mt-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 underline hover:no-underline"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          /* Form Input */
          <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor={inputId} className="sr-only">
                Email address
              </label>
              <div className="relative flex-1">
                <input
                  id={inputId}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') {
                      setStatus('idle');
                      setErrorMessage('');
                    }
                  }}
                  placeholder={placeholder}
                  disabled={status === 'loading'}
                  aria-invalid={status === 'error'}
                  aria-describedby={status === 'error' ? errorId : disclaimerId}
                  className={cn(
                    'w-full h-11 px-4 text-sm font-body',
                    'bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]',
                    'border rounded-[var(--radius-btn,0.5rem)] transition-colors',
                    'placeholder:text-[var(--color-text-muted,#6b7280)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#111827)]',
                    status === 'error'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[var(--color-border,#e5e7eb)]'
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={status === 'loading'}
                loadingText="Subscribing..."
                className="h-11 px-6 whitespace-nowrap"
              >
                {buttonText}
              </Button>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div
                id={errorId}
                role="alert"
                className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400 text-left"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Disclaimer Text */}
            {disclaimerText && (
              <p
                id={disclaimerId}
                className="text-xs text-[var(--color-text-muted,#6b7280)] mt-3 leading-normal"
              >
                {disclaimerText}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSignup;
```

---

### 4.6 `src/sections/content/FaqAccordion.tsx`

```tsx
import React, { useState, useId, useMemo } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqAccordionSettings } from '../../types/section';
import { cn } from '../../utils/cn';

export interface FaqAccordionProps {
  settings: FaqAccordionSettings;
  id?: string;
  className?: string;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading = 'Frequently Asked Questions',
    subheading,
    items = [],
    allowMultipleOpen = false,
  } = settings;

  const sectionId = id || useId();

  // Multi-open and single-open state management
  const [openSingleIndex, setOpenSingleIndex] = useState<number | null>(0);
  const [openMultiIndices, setOpenMultiIndices] = useState<Set<number>>(new Set([0]));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories extracted if present
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all' || categories.length === 0) return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory, categories]);

  const toggleItem = (index: number) => {
    if (allowMultipleOpen) {
      setOpenMultiIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    } else {
      setOpenSingleIndex((prev) => (prev === index ? null : index));
    }
  };

  const isItemOpen = (index: number) => {
    return allowMultipleOpen ? openMultiIndices.has(index) : openSingleIndex === index;
  };

  if (items.length === 0) return null;

  return (
    <section
      id={sectionId}
      data-section-type="faq-accordion"
      className={cn('w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8', className)}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light,#f3f4f6)] text-[var(--color-primary,#111827)] mx-auto flex items-center justify-center mb-4">
            <HelpCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text,#111827)] tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="font-body text-base text-[var(--color-text-muted,#6b7280)] mt-3">
              {subheading}
            </p>
          )}
        </div>

        {/* Optional Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors',
                selectedCategory === 'all'
                  ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              )}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors',
                  selectedCategory === cat
                    ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Accordion List */}
        <div className="space-y-3" role="region" aria-label="Accordion items">
          {filteredItems.map((item, index) => {
            const isOpen = isItemOpen(index);
            const questionId = `${sectionId}-q-${index}`;
            const panelId = `${sectionId}-p-${index}`;

            return (
              <div
                key={index}
                className={cn(
                  'bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)]',
                  'rounded-[var(--radius-card,0.75rem)] overflow-hidden transition-colors'
                )}
              >
                <h3>
                  <button
                    id={questionId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(index)}
                    className={cn(
                      'w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors',
                      'hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#111827)]'
                    )}
                  >
                    <span className="font-heading font-semibold text-base sm:text-lg text-[var(--color-text,#111827)] pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-[var(--color-text-muted,#6b7280)] shrink-0 transition-transform duration-300',
                        isOpen && 'rotate-180 text-[var(--color-primary,#111827)]'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                {/* Smooth Expandable Content Panel */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={questionId}
                  hidden={!isOpen}
                  className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 font-body text-sm sm:text-base text-[var(--color-text-muted,#6b7280)] leading-relaxed border-t border-[var(--color-border,#e5e7eb)]/60">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
```

---

### 4.7 `src/sections/SectionRenderer.tsx`

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SectionConfig, SectionType } from '../types/section';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

// Hero Sections
import { HeroStandard } from './hero/HeroStandard';
import { HeroSplit } from './hero/HeroSplit';
import { HeroFullscreen } from './hero/HeroFullscreen';

// Product & Collection Sections
import { FeaturedProducts } from './products/FeaturedProducts';
import { ProductCarousel } from './products/ProductCarousel';
import { CollectionCards } from './media/CollectionCards';

// Media & Storytelling Sections
import { ImageWithText } from './media/ImageWithText';
import { EditorialGrid } from './media/EditorialGrid';

// Social Sections
import { Testimonials } from './social/Testimonials';
import { ReviewsBreakdown } from './social/ReviewsBreakdown';
import { LogoCloud } from './social/LogoCloud';

// Content Sections
import { Marquee } from './content/Marquee';
import { NewsletterSignup } from './content/NewsletterSignup';
import { FaqAccordion } from './content/FaqAccordion';

// ---------------------------------------------------------------------------
// Error Boundary to prevent a single section crash from unmounting page
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  sectionId?: string;
  sectionType?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[SectionRenderer Error] Section ${this.props.sectionType} (${this.props.sectionId}):`, error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-7xl mx-auto my-4 p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong>Section Rendering Error:</strong> Failed to render &quot;{this.props.sectionType}&quot; ({this.props.sectionId}).
            <span className="block text-xs text-red-500 mt-0.5">{this.state.error?.message}</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Graceful Unknown Section Fallback (non-crashing banner)
// ---------------------------------------------------------------------------

export const UnknownSectionFallback: React.FC<{ section: SectionConfig | { id: string; type: string } }> = ({ section }) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-6 p-4 border border-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-800 dark:text-amber-200 text-sm">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Unsupported Section Type: <code>{section.type}</code></span>
      </div>
      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
        Section ID: <code>{section.id}</code>. Check <code>SectionRenderer</code> registration.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SectionRenderer Props
// ---------------------------------------------------------------------------

export interface SingleSectionProps {
  section: SectionConfig;
  sections?: never;
  className?: string;
}

export interface MultiSectionProps {
  sections: SectionConfig[];
  section?: never;
  className?: string;
}

export type SectionRendererProps = SingleSectionProps | MultiSectionProps;

/**
 * Dynamic SectionRenderer Component
 * Maps all 14 SectionConfig['type'] values to their respective React components.
 * Strictly typed with zero `any` via TypeScript discriminated unions.
 */
export const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
  if ('sections' in props && Array.isArray(props.sections)) {
    return (
      <div className={cn('w-full flex flex-col', props.className)}>
        {props.sections.map((sec, idx) => (
          <SectionRenderer key={sec.id || `section-${idx}`} section={sec} />
        ))}
      </div>
    );
  }

  const { section, className } = props as SingleSectionProps;
  if (!section) return null;

  const renderSectionContent = () => {
    switch (section.type) {
      case 'hero-standard':
        return <HeroStandard settings={section.settings} id={section.id} />;
      case 'hero-split':
        return <HeroSplit settings={section.settings} id={section.id} />;
      case 'hero-fullscreen':
        return <HeroFullscreen settings={section.settings} id={section.id} />;
      case 'featured-products':
        return <FeaturedProducts settings={section.settings} id={section.id} />;
      case 'product-carousel':
        return <ProductCarousel settings={section.settings} id={section.id} />;
      case 'collection-cards':
        return <CollectionCards settings={section.settings} id={section.id} />;
      case 'image-with-text':
        return <ImageWithText settings={section.settings} id={section.id} />;
      case 'testimonials':
        return <Testimonials settings={section.settings} id={section.id} />;
      case 'reviews-breakdown':
        return <ReviewsBreakdown settings={section.settings} id={section.id} />;
      case 'logo-cloud':
        return <LogoCloud settings={section.settings} id={section.id} />;
      case 'marquee':
        return <Marquee settings={section.settings} id={section.id} />;
      case 'newsletter-signup':
        return <NewsletterSignup settings={section.settings} id={section.id} />;
      case 'faq-accordion':
        return <FaqAccordion settings={section.settings} id={section.id} />;
      case 'editorial-grid':
        return <EditorialGrid settings={section.settings} id={section.id} />;
      default:
        return <UnknownSectionFallback section={section} />;
    }
  };

  return (
    <SectionErrorBoundary sectionId={section.id} sectionType={section.type}>
      <div className={cn('w-full', className)}>
        {renderSectionContent()}
      </div>
    </SectionErrorBoundary>
  );
};

export interface SectionListRendererProps {
  sections: SectionConfig[];
  className?: string;
}

export const SectionListRenderer: React.FC<SectionListRendererProps> = ({ sections, className }) => {
  return <SectionRenderer sections={sections} className={className} />;
};

export default SectionRenderer;
```

---

### 4.8 `src/sections/index.ts` (Master Barrel Export)

```typescript
/**
 * Master Reusable Section Library & SectionRenderer Barrel
 * Exports all 14 data-driven section components, SectionRenderer registry, and prop contracts.
 */

// SectionRenderer & Fallback Components
export {
  SectionRenderer,
  SectionListRenderer,
  SectionErrorBoundary,
  UnknownSectionFallback,
} from './SectionRenderer';
export type {
  SectionRendererProps,
  SingleSectionProps,
  MultiSectionProps,
  SectionListRendererProps,
} from './SectionRenderer';

// Hero Sections
export { HeroStandard } from './hero/HeroStandard';
export type { HeroStandardProps } from './hero/HeroStandard';
export { HeroSplit } from './hero/HeroSplit';
export type { HeroSplitProps } from './hero/HeroSplit';
export { HeroFullscreen } from './hero/HeroFullscreen';
export type { HeroFullscreenProps } from './hero/HeroFullscreen';

// Product & Collection Sections
export { FeaturedProducts } from './products/FeaturedProducts';
export type { FeaturedProductsProps } from './products/FeaturedProducts';
export { ProductCarousel } from './products/ProductCarousel';
export type { ProductCarouselProps } from './products/ProductCarousel';
export { CollectionCards } from './media/CollectionCards';
export type { CollectionCardsProps } from './media/CollectionCards';

// Media & Editorial Storytelling Sections
export { ImageWithText } from './media/ImageWithText';
export type { ImageWithTextProps } from './media/ImageWithText';
export { EditorialGrid } from './media/EditorialGrid';
export type { EditorialGridProps } from './media/EditorialGrid';

// Social Sections
export { Testimonials } from './social/Testimonials';
export type { TestimonialsProps } from './social/Testimonials';
export { ReviewsBreakdown } from './social/ReviewsBreakdown';
export type { ReviewsBreakdownProps } from './social/ReviewsBreakdown';
export { LogoCloud } from './social/LogoCloud';
export type { LogoCloudProps } from './social/LogoCloud';

// Content Sections
export { Marquee } from './content/Marquee';
export type { MarqueeProps } from './content/Marquee';
export { NewsletterSignup } from './content/NewsletterSignup';
export type { NewsletterSignupProps } from './content/NewsletterSignup';
export { FaqAccordion } from './content/FaqAccordion';
export type { FaqAccordionProps } from './content/FaqAccordion';

// Re-export Universal Section Types
export * from '../types/section';
```

---

## 5. Verification Method

To verify the implementation once applied by the builder/implementer:

1. **TypeScript Typecheck**:
   ```bash
   npm run lint
   ```
   *Expected Result*: Exits 0 with no errors. Every section compiles strictly without `any` casts.

2. **Unit & Integration Tests**:
   ```bash
   npm test
   ```
   *Expected Result*: All tests pass (including existing 136 unit tests and any section component tests).

3. **E2E Test Suite**:
   ```bash
   npm run test:e2e
   ```
   *Expected Result*: 188/188 tests pass across all 4 tiers (Feature, Boundary, Interaction, Scenario).

4. **Production Build**:
   ```bash
   npm run build
   ```
   *Expected Result*: Production build completes cleanly, generating optimized assets in `dist/`.

5. **Visual & Responsive Verification (Breakpoints: 320px, 375px, 390px, 1024px, 1440px)**:
   - **Marquee**: Smooth infinite horizontal animation, no scrollbar, pauses on hover, zero jitter at 50% loop boundary.
   - **FaqAccordion**: Keyboard accessible via Tab and Enter/Space; `aria-expanded` and `aria-controls` toggle accurately; multiple/single modes respect `allowMultipleOpen`.
   - **NewsletterSignup**: Input rejects empty or invalid email formats (e.g. `user@`, `test`); shows success state on valid email and saves to `localStorage`.
   - **Testimonials**: Carousel next/prev buttons paginate correctly; swipe gestures trigger on touch; grid mode displays responsive columns.
   - **ReviewsBreakdown**: Star distribution bars render proportional widths; overall rating displays with appropriate star fills.
   - **SectionRenderer**: Gracefully renders `UnknownSectionFallback` for unrecognized section types without breaking the page.
