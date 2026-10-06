/**
 * Master Reusable Section Library & SectionRenderer Barrel
 * Exports all 14 data-driven section components, ProductCard atom, SectionRenderer registry, and prop contracts.
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
export { ProductCard } from './products/ProductCard';
export type { ProductCardProps } from './products/ProductCard';
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
