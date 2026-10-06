/**
 * Data-Driven Section Configuration System
 * Replaces loose `Record<string, any>` with a strict discriminated union across all 14 section variants.
 * Zero `any` — provides automatic type narrowing in SectionRenderer via `switch (section.type)`.
 */

// 1. Hero Standard (Centered luxury / crest layout)
export interface HeroStandardSettings {
  heading: string;
  subheading?: string;
  eyebrow?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number; // 0.0 to 1.0
  textAlignment?: 'left' | 'center' | 'right';
  crestImageUrl?: string;
  badgeText?: string;
}

// 2. Hero Split (50-50 storytelling & featured product layout)
export interface HeroSplitSettings {
  heading: string;
  subheading?: string;
  tagline?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  featuredProductId?: string;
  stats?: Array<{ label: string; value: string }>;
}

// 3. Hero Fullscreen (100vh cinematic banner)
export interface HeroFullscreenSettings {
  heading: string;
  subheading?: string;
  eyebrow?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  overlayOpacity?: number; // 0.0 to 1.0
  textPosition?: 'bottom-left' | 'center' | 'bottom-center';
  scrollIndicator?: boolean;
}

// 4. Featured Products (Card grid with dynamic skinning)
export interface FeaturedProductsSettings {
  heading: string;
  subheading?: string;
  productHandles?: string[];
  collectionHandle?: string;
  limit?: number;
  columns?: 2 | 3 | 4;
  viewAllLink?: string;
  viewAllText?: string;
}

// 5. Product Carousel (Touch/swipe slider with navigation controls)
export interface ProductCarouselSettings {
  heading: string;
  subheading?: string;
  productHandles?: string[];
  collectionHandle?: string;
  autoplay?: boolean;
  autoplayIntervalMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

// 6. Collection Cards (Banner grid of categories)
export interface CollectionCardItem {
  handle: string;
  title: string;
  imageUrl: string;
  itemCountText?: string;
  description?: string;
}

export interface CollectionCardsSettings {
  heading?: string;
  subheading?: string;
  collections: CollectionCardItem[];
  columns?: 2 | 3 | 4;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

// 7. Image With Text (Alternating editorial storytelling block)
export interface ImageWithTextSettings {
  heading: string;
  content: string;
  eyebrow?: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  ctaText?: string;
  ctaLink?: string;
  statHighlight?: { value: string; label: string };
}

// 8. Testimonials (Customer quotes, ratings, and avatars)
export interface TestimonialItem {
  id: string;
  author: string;
  roleOrLocation?: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  productReferenced?: string;
}

export interface TestimonialsSettings {
  heading?: string;
  subheading?: string;
  testimonials: TestimonialItem[];
  layout?: 'grid' | 'carousel';
}

// 9. Reviews Breakdown (Star ratings and review distribution)
export interface StarRatingBucket {
  stars: number;
  count: number;
  percentage: number;
}

export interface FeaturedReview {
  author: string;
  title: string;
  content: string;
  rating: number;
  verifiedBuyer: boolean;
  date?: string;
}

export interface ReviewsBreakdownSettings {
  heading?: string;
  averageRating: number;
  totalReviews: number;
  recommendedPercentage?: number;
  distribution?: StarRatingBucket[];
  featuredReview?: FeaturedReview;
}

// 10. Logo Cloud (Partner brands and press logos)
export interface LogoItem {
  name: string;
  logoUrl?: string;
  quote?: string;
  externalUrl?: string;
}

export interface LogoCloudSettings {
  heading?: string;
  logos: LogoItem[];
  grayscale?: boolean;
  layout?: 'row' | 'grid';
}

// 11. Marquee (Infinite announcement ticker)
export interface MarqueeSettings {
  items: string[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  separator?: string;
  backgroundColor?: string;
  textColor?: string;
}

// 12. Newsletter Signup (Interactive newsletter subscription form)
export interface NewsletterSignupSettings {
  heading: string;
  subheading?: string;
  placeholder?: string;
  buttonText?: string;
  disclaimerText?: string;
  successMessage?: string;
}

// 13. FAQ Accordion (Collapsible accessible questions & answers)
export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FaqAccordionSettings {
  heading: string;
  subheading?: string;
  items: FaqItem[];
  allowMultipleOpen?: boolean;
}

// 14. Editorial Grid (Asymmetrical magazine-style image & content grid)
export interface EditorialGridItem {
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  span?: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'row-span-2';
}

export interface EditorialGridSettings {
  heading?: string;
  subheading?: string;
  items: EditorialGridItem[];
}

// Base Generic Section Definition
export interface BaseSectionConfig<TType extends string, TSettings> {
  id: string;
  type: TType;
  settings: TSettings;
}

// Individual Strongly-Typed Section Configs
export type HeroStandardSectionConfig = BaseSectionConfig<'hero-standard', HeroStandardSettings>;
export type HeroSplitSectionConfig = BaseSectionConfig<'hero-split', HeroSplitSettings>;
export type HeroFullscreenSectionConfig = BaseSectionConfig<'hero-fullscreen', HeroFullscreenSettings>;
export type FeaturedProductsSectionConfig = BaseSectionConfig<'featured-products', FeaturedProductsSettings>;
export type ProductCarouselSectionConfig = BaseSectionConfig<'product-carousel', ProductCarouselSettings>;
export type CollectionCardsSectionConfig = BaseSectionConfig<'collection-cards', CollectionCardsSettings>;
export type ImageWithTextSectionConfig = BaseSectionConfig<'image-with-text', ImageWithTextSettings>;
export type TestimonialsSectionConfig = BaseSectionConfig<'testimonials', TestimonialsSettings>;
export type ReviewsBreakdownSectionConfig = BaseSectionConfig<'reviews-breakdown', ReviewsBreakdownSettings>;
export type LogoCloudSectionConfig = BaseSectionConfig<'logo-cloud', LogoCloudSettings>;
export type MarqueeSectionConfig = BaseSectionConfig<'marquee', MarqueeSettings>;
export type NewsletterSignupSectionConfig = BaseSectionConfig<'newsletter-signup', NewsletterSignupSettings>;
export type FaqAccordionSectionConfig = BaseSectionConfig<'faq-accordion', FaqAccordionSettings>;
export type EditorialGridSectionConfig = BaseSectionConfig<'editorial-grid', EditorialGridSettings>;

// Master Discriminated Union
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

// Helper Union Types
export type SectionType = SectionConfig['type'];
export type SectionSettings = SectionConfig['settings'];

// Utility type to extract section config by discriminator
export type ExtractSectionConfig<T extends SectionType> = Extract<SectionConfig, { type: T }>;
