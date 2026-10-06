# Handoff Report: Explorer M3-1 (Hero and Layout Section Architect)

## 1. Observation
1. **Contract Definitions**:
   - `src/types/section.ts` defines explicit TypeScript interfaces for all 14 section types with zero `any` types. Specifically:
     - `HeroStandardSettings` (lines 8–21): `heading: string`, optional `subheading`, `eyebrow`, `primaryCtaText`, `primaryCtaLink`, `secondaryCtaText`, `secondaryCtaLink`, `backgroundImageUrl`, `overlayOpacity` (0.0 to 1.0), `textAlignment` ('left' | 'center' | 'right'), `crestImageUrl`, `badgeText`.
     - `HeroSplitSettings` (lines 24–37): `heading: string`, optional `subheading`, `tagline`, `primaryCtaText`, `primaryCtaLink`, `secondaryCtaText`, `secondaryCtaLink`, `imageUrl: string`, `imageAlt: string`, `imagePosition` ('left' | 'right'), `featuredProductId`, `stats: Array<{ label: string; value: string }>`.
     - `HeroFullscreenSettings` (lines 40–51): `heading: string`, optional `subheading`, `eyebrow`, `primaryCtaText`, `primaryCtaLink`, `mediaUrl: string`, optional `mediaType` ('image' | 'video'), `overlayOpacity` (0.0 to 1.0), `textPosition` ('bottom-left' | 'center' | 'bottom-center'), `scrollIndicator: boolean`.
     - `ImageWithTextSettings` (lines 95–105): `heading: string`, `content: string`, optional `eyebrow`, `imageUrl: string`, `imageAlt: string`, `imagePosition` ('left' | 'right'), `ctaText`, `ctaLink`, `statHighlight: { value: string; label: string }`.
     - `EditorialGridSettings` & `EditorialGridItem` (lines 201–213): `heading?: string`, `subheading?: string`, `items: EditorialGridItem[]` where each item has `title: string`, optional `subtitle`, `imageUrl: string`, `link`, and `span` ('col-span-1' | 'col-span-2' | 'col-span-3' | 'row-span-2').
2. **Existing Primitives**:
   - `src/components/common/Button.tsx`: Exports `Button` supporting variants (`primary`, `secondary`, `outline`, `ghost`, `danger`, `link`), sizes (`sm`, `md`, `lg`, `icon`), `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`. Integrates `--color-primary`, `--color-surface`, `--color-border`, `--radius-btn`.
   - `src/components/common/ImageWithFallback.tsx`: Exports `ImageWithFallback` supporting `src`, `alt`, `fallbackCategory` ('coffee' | 'fashion' | 'jewelry' | 'electronics' | 'general'), `aspectRatio` ('square' | 'portrait' | 'landscape' | 'wide' | 'auto'), `containerClassName`, `showSkeleton`.
   - `src/components/common/Badge.tsx`: Exports `Badge` supporting variants (`default`, `primary`, `secondary`, `outline`, `success`, `warning`, `danger`, `sale`), sizes (`sm`, `md`), and dot animation.
3. **Theme Token System**:
   - `src/engine/ThemeContext.tsx` & `src/index.css` dynamically inject CSS custom properties:
     - `--font-heading`, `--font-body`, `--font-mono`
     - `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`
     - `--theme-radius`, `--radius-btn`, `--radius-card`, `--radius-badge`
     - `--animation-duration`, `--animation-easing`
   - `tailwind.config.js` maps `font-heading`, `font-body`, `font-mono`, `primary`, `secondary`, `accent`, `background`, `surface`, `border`, `text` directly to these CSS variables.
4. **Current Test Status**:
   - `npm test`: 136 passed across 6 test files.
   - `npm run test:e2e`: 188/188 passed across 4 tiers with zero failures.
   - `npm run build`: fails currently due to unused variables in `src/engine/__tests__/challenger_m2_2_stress.test.tsx` (`normalizeForSearch` line 45, `useStore` line 64). Source files in `src/sections/` do not yet exist.
5. **Peer Explorer Alignment**:
   - `explorer_m3_2`: Responsible for `FeaturedProducts`, `ProductCarousel`, and `CollectionCards`.
   - `explorer_m3_3`: Responsible for `Testimonials`, `ReviewsBreakdown`, `LogoCloud`, `Marquee`, `NewsletterSignup`, `FaqAccordion`, `SectionRenderer.tsx`, and `src/sections/index.ts`.
   - Props contract agreement: Each section component takes `{ id?: string; settings: TSettings; className?: string }` matching the discriminated union narrowing in `SectionRenderer`.

---

## 2. Logic Chain
1. **Contract Consistency**:
   - Because `src/types/section.ts` models sections as `BaseSectionConfig<TType, TSettings>`, `SectionRenderer` can narrow `section.type` via `switch (section.type)` and pass `settings={section.settings}` and `id={section.id}` to the corresponding component.
   - Therefore, all 5 section components (`HeroStandard`, `HeroSplit`, `HeroFullscreen`, `ImageWithText`, `EditorialGrid`) must accept `settings: TSettings` as a required prop, plus optional `id?: string` and `className?: string`.
2. **Theme Integration & Styling**:
   - The project mandates support for 4 visually distinct stores (Coffee, Fashion, Jewelry, Electronics).
   - Rather than hardcoding colors or styles, all typography must use `font-heading` and `font-body`, and all colors must reference theme variables (`text-[var(--color-primary)]`, `bg-[var(--color-background)]`, `bg-[var(--color-surface)]`, `border-[var(--color-border)]`).
   - Border radii must use `rounded-[var(--theme-radius)]`, `rounded-[var(--radius-card)]`, or `rounded-[var(--radius-btn)]`.
3. **Responsiveness (320px to 1440px)**:
   - At 320px–375px: Grids must collapse to single column (`grid-cols-1`), hero typography must scale from `text-3xl` down to avoid overflow, and CTA buttons must wrap cleanly with `flex-wrap` and full-width mobile friendliness.
   - At 1024px: Two-column splits (`grid-cols-1 lg:grid-cols-2`) activate for `HeroSplit` and `ImageWithText`.
   - At 1440px: Containers remain bounded with `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` while `HeroFullscreen` delivers edge-to-edge cinematic immersion.
4. **Tailwind Class Safety for Dynamic Spans**:
   - `EditorialGridItem.span` has type `'col-span-1' | 'col-span-2' | 'col-span-3' | 'row-span-2'`.
   - Tailwind does not scan dynamically constructed class strings at build time.
   - To prevent missing styles in production builds, a static dictionary `SPAN_CLASSES` must map each span value to static Tailwind class combinations (e.g. `'col-span-2': 'col-span-1 md:col-span-2'`).
5. **Accessibility & Resilience**:
   - Semantic `<section id={id} aria-label={...}>` landmarks.
   - Contrast preservation: `HeroStandard` and `HeroFullscreen` overlay opacities must be clamped between `0.0` and `1.0` (defaulting to safe legible values 0.4–0.5).
   - Video in `HeroFullscreen` must include `autoPlay loop muted playsInline` with fallback accessibility markup.
   - Scroll indicator in `HeroFullscreen` triggers smooth scrolling via `window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' })`.
   - All image displays utilize `ImageWithFallback` to guarantee graceful rendering even when external Unsplash/placeholder networks fail.

---

## 3. Caveats
1. **Unused Imports in Test File**:
   - `src/engine/__tests__/challenger_m2_2_stress.test.tsx` currently fails `tsc` due to unused locals (`normalizeForSearch`, `useStore`). The implementer/orchestrator should clean up these two unused imports during the implementation phase.
2. **Router Context vs Pure Anchor Tags**:
   - CTAs accept string URLs (`primaryCtaLink`, etc.). To prevent runtime routing errors when rendered in isolated unit test environments without a `BrowserRouter` wrapper, CTA links should render as standard accessible `<a href={link}>` tags wrapping `<Button>`.
3. **Reduced Motion**:
   - For video playback in `HeroFullscreen`, components should respect `prefers-reduced-motion` where possible or provide clean static image posters.

---

## 4. Conclusion & Technical Blueprint

The complete technical blueprint is structured into 5 component specifications, complete with drop-in TypeScript implementations ready for the implementer agent.

### 4.1 Component 1: `HeroStandard` (`src/sections/hero/HeroStandard.tsx`)

```tsx
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
```

---

### 4.2 Component 2: `HeroSplit` (`src/sections/hero/HeroSplit.tsx`)

```tsx
import React from 'react';
import { HeroSplitSettings } from '../../types/section';
import { Button } from '../../components/common/Button';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { cn } from '../../utils/cn';

export interface HeroSplitProps {
  id?: string;
  settings: HeroSplitSettings;
  className?: string;
}

export const HeroSplit: React.FC<HeroSplitProps> = ({ id, settings, className }) => {
  const {
    heading,
    subheading,
    tagline,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    imageUrl,
    imageAlt,
    imagePosition = 'right',
    featuredProductId,
    stats,
  } = settings;

  const isImageLeft = imagePosition === 'left';

  return (
    <section
      id={id}
      aria-label={heading}
      className={cn(
        'w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content Column */}
          <div
            className={cn(
              'flex flex-col justify-center order-1',
              isImageLeft ? 'lg:order-2' : 'lg:order-1'
            )}
          >
            {tagline && (
              <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest uppercase text-[var(--color-primary)] font-body mb-3">
                {tagline}
              </span>
            )}

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-text)] leading-[1.15] mb-5">
              {heading}
            </h1>

            {subheading && (
              <p className="font-body text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed mb-8 max-w-xl">
                {subheading}
              </p>
            )}

            {/* CTAs */}
            {(primaryCtaText || secondaryCtaText) && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
                {primaryCtaText && (
                  <a href={primaryCtaLink || '#'} className="inline-block no-underline">
                    <Button variant="primary" size="lg" className="min-w-[150px]">
                      {primaryCtaText}
                    </Button>
                  </a>
                )}
                {secondaryCtaText && (
                  <a href={secondaryCtaLink || '#'} className="inline-block no-underline">
                    <Button variant="outline" size="lg" className="min-w-[150px]">
                      {secondaryCtaText}
                    </Button>
                  </a>
                )}
              </div>
            )}

            {/* Stats Display */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-[var(--color-border)]">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
                      {stat.value}
                    </span>
                    <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Column */}
          <div
            className={cn(
              'relative order-2',
              isImageLeft ? 'lg:order-1' : 'lg:order-2'
            )}
          >
            <div className="relative group overflow-hidden rounded-[var(--radius-card,var(--theme-radius,1rem))] border border-[var(--color-border)] shadow-lg bg-[var(--color-surface)]">
              <ImageWithFallback
                src={imageUrl}
                alt={imageAlt || heading}
                aspectRatio="portrait"
                fallbackCategory="coffee"
                containerClassName="w-full aspect-[4/5] max-h-[600px]"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Optional Featured Product Overlay */}
              {featuredProductId && (
                <div className="absolute bottom-4 left-4 right-4 bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] p-3.5 rounded-[var(--radius-btn,0.5rem)] shadow-lg flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--color-text-muted)]">
                      Featured Origin
                    </span>
                    <span className="text-xs sm:text-sm font-heading font-semibold text-[var(--color-text)] truncate">
                      {imageAlt || 'Selected Reserve'}
                    </span>
                  </div>
                  <a
                    href={`/coffee/products/${featuredProductId}`}
                    className="shrink-0 text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    View Details &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;
```

---

### 4.3 Component 3: `HeroFullscreen` (`src/sections/hero/HeroFullscreen.tsx`)

```tsx
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
```

---

### 4.4 Component 4: `ImageWithText` (`src/sections/media/ImageWithText.tsx`)

```tsx
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
```

---

### 4.5 Component 5: `EditorialGrid` (`src/sections/media/EditorialGrid.tsx`)

```tsx
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
```

---

### 4.6 Barrel Exports Blueprint

#### `src/sections/hero/index.ts`
```typescript
export * from './HeroStandard';
export * from './HeroSplit';
export * from './HeroFullscreen';
```

#### `src/sections/media/index.ts`
```typescript
export * from './ImageWithText';
export * from './EditorialGrid';
```

---

## 5. Verification Method

To independently verify the implementation when files are created:

1. **Type Checking & Build**:
   ```powershell
   npx tsc --noEmit
   npm run build
   ```
   *Expected outcome*: Clean compilation with 0 TypeScript diagnostics and clean Vite bundle output.

2. **Synthetic Type Contract Verification**:
   Inspect that `src/types/__tests__/types.test.ts` validates all section variants without type assertions.
   ```powershell
   npx vitest run src/types/__tests__/types.test.ts
   ```

3. **E2E Test Suite Run**:
   ```powershell
   npm run test:e2e
   ```
   *Expected outcome*: 188/188 tests passing across all 4 tiers.

4. **Responsive Visual Verification (320px to 1440px)**:
   - Verify 320px / 375px: No horizontal scroll bar (`overflow-x: hidden`), single-column layout for `HeroSplit`, `ImageWithText`, `EditorialGrid`.
   - Verify 1024px: 2-column split layout for `HeroSplit` and `ImageWithText`.
   - Verify 1440px: Centered constrained max-width (`max-w-7xl`) for content, edge-to-edge 100vh for `HeroFullscreen`.

5. **Invalidation Conditions**:
   - Any use of `any` type in component props or internals.
   - Any broken image layout when `imageUrl` or `backgroundImageUrl` is missing or fails.
   - Any horizontal scrollbar appearing at 320px or 375px viewports.
