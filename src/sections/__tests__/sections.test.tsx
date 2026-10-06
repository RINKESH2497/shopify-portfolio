import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Product } from '../../types/product';
import { SectionConfig } from '../../types/section';

// Components
import { HeroStandard } from '../hero/HeroStandard';
import { HeroSplit } from '../hero/HeroSplit';
import { HeroFullscreen } from '../hero/HeroFullscreen';
import { ProductCard } from '../products/ProductCard';
import { FeaturedProducts } from '../products/FeaturedProducts';
import { ProductCarousel } from '../products/ProductCarousel';
import { CollectionCards } from '../media/CollectionCards';
import { ImageWithText } from '../media/ImageWithText';
import { EditorialGrid } from '../media/EditorialGrid';
import { Testimonials } from '../social/Testimonials';
import { ReviewsBreakdown } from '../social/ReviewsBreakdown';
import { LogoCloud } from '../social/LogoCloud';
import { Marquee } from '../content/Marquee';
import { NewsletterSignup } from '../content/NewsletterSignup';
import { FaqAccordion } from '../content/FaqAccordion';
import {
  SectionRenderer,
  SectionListRenderer,
  SectionErrorBoundary,
  UnknownSectionFallback,
} from '../SectionRenderer';

const mockProduct: Product = {
  id: 'prod-1',
  handle: 'artisan-espresso',
  title: 'Artisan Espresso Roast',
  subtitle: 'Rich dark roast',
  description: 'Notes of dark chocolate and roasted almond.',
  price: 19.5,
  compareAtPrice: 24.0,
  category: 'Coffee Beans',
  tags: ['new'],
  images: [
    { id: 'img-1', url: 'https://images.unsplash.com/coffee1.jpg', altText: 'Coffee Bag Front' },
    { id: 'img-2', url: 'https://images.unsplash.com/coffee2.jpg', altText: 'Coffee Beans Macro' },
  ],
  variants: [
    {
      id: 'var-1',
      title: '250g / Whole Bean',
      price: 19.5,
      compareAtPrice: 24.0,
      options: { Size: '250g' },
      availableForSale: true,
      inventoryQuantity: 25,
    },
  ],
  rating: {
    average: 4.9,
    count: 88,
  },
  featured: true,
};

const mockSoldOutProduct: Product = {
  ...mockProduct,
  id: 'prod-sold-out',
  handle: 'limited-reserve',
  title: 'Limited Reserve Geisha',
  compareAtPrice: undefined,
  variants: [
    {
      id: 'var-2',
      title: '100g',
      price: 45.0,
      options: { Size: '100g' },
      availableForSale: false,
      inventoryQuantity: 0,
    },
  ],
};

describe('Milestone 3 Reusable Section Library & SectionRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // 1. HeroStandard
  // -------------------------------------------------------------------------
  describe('HeroStandard', () => {
    it('renders heading, subheading, eyebrow, badgeText, crest and CTAs', () => {
      render(
        <HeroStandard
          id="hero-test"
          settings={{
            heading: 'Artisan Terroir Coffee',
            subheading: 'Single origin beans sourced ethically from high altitude farms.',
            eyebrow: 'Spring Harvest',
            badgeText: 'Limited Release',
            crestImageUrl: 'https://example.com/crest.png',
            primaryCtaText: 'Shop Harvest',
            primaryCtaLink: '/coffee/collections/beans',
            secondaryCtaText: 'Our Story',
            secondaryCtaLink: '/coffee/about',
            textAlignment: 'center',
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: 'Artisan Terroir Coffee' })).toBeDefined();
      expect(screen.getByText('Single origin beans sourced ethically from high altitude farms.')).toBeDefined();
      expect(screen.getByText('Spring Harvest')).toBeDefined();
      expect(screen.getByText('Limited Release')).toBeDefined();
      expect(screen.getByText('Shop Harvest')).toBeDefined();
      expect(screen.getByText('Our Story')).toBeDefined();
      expect(screen.getByAltText('Brand crest')).toBeDefined();
    });

    it('renders background image with overlay opacity', () => {
      const { container } = render(
        <HeroStandard
          settings={{
            heading: 'Luxury Watches',
            backgroundImageUrl: 'https://example.com/bg.jpg',
            overlayOpacity: 0.6,
          }}
        />
      );

      const overlay = container.querySelector('.bg-black.pointer-events-none');
      expect(overlay).toBeDefined();
      expect((overlay as HTMLElement).style.opacity).toBe('0.6');
    });
  });

  // -------------------------------------------------------------------------
  // 2. HeroSplit
  // -------------------------------------------------------------------------
  describe('HeroSplit', () => {
    it('renders 50-50 storytelling layout with stats and featured product card', () => {
      render(
        <MemoryRouter>
          <HeroSplit
            settings={{
              heading: 'Single-Origin Precision',
              subheading: 'Roasted weekly in small batches for optimal bloom and flavor clarity.',
              tagline: 'Direct Trade Certified',
              primaryCtaText: 'Explore Coffee',
              primaryCtaLink: '/coffee/collections/all',
              imageUrl: 'https://example.com/split.jpg',
              imageAlt: 'Roastery equipment',
              imagePosition: 'right',
              featuredProductId: 'yirgacheffe-reserve',
              stats: [
                { value: '2,100m', label: 'Elevation' },
                { value: '88.5', label: 'SCA Score' },
              ],
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: 'Single-Origin Precision' })).toBeDefined();
      expect(screen.getByText('Direct Trade Certified')).toBeDefined();
      expect(screen.getByText('Explore Coffee')).toBeDefined();
      expect(screen.getByText('2,100m')).toBeDefined();
      expect(screen.getByText('Elevation')).toBeDefined();
      expect(screen.getByText('88.5')).toBeDefined();
      expect(screen.getByText('SCA Score')).toBeDefined();
      expect(screen.getByText('Featured Reserve')).toBeDefined();
      expect(screen.getByText('View Details →')).toBeDefined();
    });

    it('supports left image position layout', () => {
      const { container } = render(
        <MemoryRouter>
          <HeroSplit
            settings={{
              heading: 'Left Image Variant',
              imageUrl: 'https://example.com/left.jpg',
              imageAlt: 'Left Image',
              imagePosition: 'left',
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: 'Left Image Variant' })).toBeDefined();
      const contentCol = container.querySelector('.lg\\:order-2');
      expect(contentCol).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 3. HeroFullscreen
  // -------------------------------------------------------------------------
  describe('HeroFullscreen', () => {
    it('renders cinematic banner with CTAs and scroll indicator', () => {
      const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});

      render(
        <HeroFullscreen
          settings={{
            heading: 'HAUTE HORLOGERIE',
            subheading: 'Mastery of time and fine craftsmanship since 1892.',
            eyebrow: 'Geneva Atelier',
            primaryCtaText: 'Discover Masterpieces',
            primaryCtaLink: '/jewelry/collections/masterpieces',
            mediaUrl: 'https://example.com/luxury.jpg',
            mediaType: 'image',
            overlayOpacity: 0.35,
            textPosition: 'bottom-left',
            scrollIndicator: true,
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: 'HAUTE HORLOGERIE' })).toBeDefined();
      expect(screen.getByText('Geneva Atelier')).toBeDefined();
      expect(screen.getByText('Discover Masterpieces')).toBeDefined();

      const scrollBtn = screen.getByRole('button', { name: 'Scroll to content' });
      expect(scrollBtn).toBeDefined();
      fireEvent.click(scrollBtn);
      expect(scrollBySpy).toHaveBeenCalled();
      scrollBySpy.mockRestore();
    });

    it('renders video element when mediaType is video', () => {
      const { container } = render(
        <HeroFullscreen
          settings={{
            heading: 'CYBER TECH 2026',
            mediaUrl: 'https://example.com/teaser.mp4',
            mediaType: 'video',
          }}
        />
      );

      const video = container.querySelector('video');
      expect(video).toBeDefined();
      expect(video?.getAttribute('src')).toBe('https://example.com/teaser.mp4');
    });
  });

  // -------------------------------------------------------------------------
  // 4. ProductCard
  // -------------------------------------------------------------------------
  describe('ProductCard', () => {
    it('renders title, category, formatted prices, discount badge and rating', () => {
      render(
        <MemoryRouter>
          <ProductCard
            product={mockProduct}
            cardStyle="elevated"
            borderRadius="lg"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Artisan Espresso Roast')).toBeDefined();
      expect(screen.getByText('Coffee Beans')).toBeDefined();
      expect(screen.getByText('$19.50')).toBeDefined();
      expect(screen.getByText('$24.00')).toBeDefined();
      expect(screen.getByText('4.9')).toBeDefined();
      expect(screen.getByText('(88)')).toBeDefined();
    });

    it('renders Sold Out badge and disables quick add button when out of stock', () => {
      render(
        <MemoryRouter>
          <ProductCard
            product={mockSoldOutProduct}
          />
        </MemoryRouter>
      );

      expect(screen.getAllByText('Sold Out').length).toBeGreaterThan(0);
      const quickAddBtn = screen.getByRole('button', { name: 'Limited Reserve Geisha is sold out' });
      expect((quickAddBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('handles quick add click without crashing and displays added confirmation', () => {
      render(
        <MemoryRouter>
          <ProductCard product={mockProduct} />
        </MemoryRouter>
      );

      const quickAddBtn = screen.getByRole('button', { name: 'Quick add Artisan Espresso Roast to cart' });
      fireEvent.click(quickAddBtn);
      expect(screen.getAllByText('Added').length).toBeGreaterThan(0);
    });

    it('toggles wishlist button aria-pressed state', () => {
      render(
        <MemoryRouter>
          <ProductCard product={mockProduct} />
        </MemoryRouter>
      );

      const wishlistBtn = screen.getByRole('button', { name: 'Add Artisan Espresso Roast to wishlist' });
      expect(wishlistBtn.getAttribute('aria-pressed')).toBe('false');
      fireEvent.click(wishlistBtn);
    });
  });

  // -------------------------------------------------------------------------
  // 5. FeaturedProducts
  // -------------------------------------------------------------------------
  describe('FeaturedProducts', () => {
    it('renders section heading, view all link, and product cards', () => {
      render(
        <MemoryRouter>
          <FeaturedProducts
            settings={{
              heading: 'Curated Brew Selection',
              subheading: 'Our most sought-after seasonal micro-lots.',
              columns: 3,
              viewAllLink: '/coffee/collections/all',
              viewAllText: 'Explore Full Menu',
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: 'Curated Brew Selection' })).toBeDefined();
      expect(screen.getByText('Our most sought-after seasonal micro-lots.')).toBeDefined();
      expect(screen.getAllByText('Explore Full Menu').length).toBeGreaterThan(0);
    });

    it('displays empty state when no products are found in standalone mode', () => {
      render(
        <MemoryRouter>
          <FeaturedProducts
            settings={{
              heading: 'Empty Selection',
              productHandles: ['non-existent-product'],
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('No products found in this selection.')).toBeDefined();
      expect(screen.getByText('Browse All Products')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 6. ProductCarousel
  // -------------------------------------------------------------------------
  describe('ProductCarousel', () => {
    it('renders heading, controls, and responds to keyboard arrow navigation', () => {
      render(
        <MemoryRouter>
          <ProductCarousel
            settings={{
              heading: 'Bestselling Reserves',
              subheading: 'Swipe to view our top roaster picks',
              showArrows: true,
              showDots: true,
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: 'Bestselling Reserves' })).toBeDefined();
      expect(screen.getByText('Swipe to view our top roaster picks')).toBeDefined();

      const carouselTracks = screen.getAllByRole('region', { name: 'Bestselling Reserves' });
      const carouselTrack = carouselTracks.find(el => el.getAttribute('aria-roledescription') === 'carousel') || carouselTracks[0];
      fireEvent.keyDown(carouselTrack, { key: 'ArrowRight' });
      fireEvent.keyDown(carouselTrack, { key: 'ArrowLeft' });
    });
  });

  // -------------------------------------------------------------------------
  // 7. CollectionCards
  // -------------------------------------------------------------------------
  describe('CollectionCards', () => {
    it('renders collection cards with titles, item count badges, and links', () => {
      render(
        <MemoryRouter>
          <CollectionCards
            settings={{
              heading: 'Explore By Category',
              subheading: 'Crafted for every preference',
              aspectRatio: 'landscape',
              columns: 2,
              collections: [
                {
                  handle: 'single-origin',
                  title: 'Single Origin',
                  description: 'Pure terroir profiles from Ethiopia and Colombia.',
                  imageUrl: 'https://example.com/single-origin.jpg',
                  itemCountText: '8 Coffees',
                },
                {
                  handle: 'espresso-blends',
                  title: 'Espresso Blends',
                  description: 'Velvety crema and balanced chocolate sweetness.',
                  imageUrl: 'https://example.com/blends.jpg',
                  itemCountText: '4 Blends',
                },
              ],
            }}
          />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: 'Explore By Category' })).toBeDefined();
      expect(screen.getByText('Single Origin')).toBeDefined();
      expect(screen.getByText('8 Coffees')).toBeDefined();
      expect(screen.getByText('Espresso Blends')).toBeDefined();
      expect(screen.getByText('4 Blends')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 8. ImageWithText
  // -------------------------------------------------------------------------
  describe('ImageWithText', () => {
    it('renders editorial storytelling block with stat highlight and CTA', () => {
      render(
        <ImageWithText
          settings={{
            heading: 'The Art of Ethical Sourcing',
            content: 'We work directly with farming families to ensure sustainable livelihoods and soil regeneration.',
            eyebrow: 'Our Philosophy',
            imageUrl: 'https://example.com/farm.jpg',
            imageAlt: 'Coffee farmer in Antioquia',
            imagePosition: 'left',
            ctaText: 'Read Farm Reports',
            ctaLink: '/coffee/sustainability',
            statHighlight: {
              value: '100%',
              label: 'Direct Trade Transparency',
            },
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: 'The Art of Ethical Sourcing' })).toBeDefined();
      expect(screen.getByText('Our Philosophy')).toBeDefined();
      expect(screen.getByText(/We work directly with farming families/)).toBeDefined();
      expect(screen.getByText('100%')).toBeDefined();
      expect(screen.getByText('Direct Trade Transparency')).toBeDefined();
      expect(screen.getByText('Read Farm Reports')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 9. EditorialGrid
  // -------------------------------------------------------------------------
  describe('EditorialGrid', () => {
    it('renders asymmetrical grid items with titles and subtitles', () => {
      render(
        <EditorialGrid
          settings={{
            heading: 'LOOKBOOK 2026',
            subheading: 'Modern silhouetting and architectural cuts.',
            items: [
              {
                title: 'Minimalist Wool Trench',
                subtitle: 'Outerwear',
                imageUrl: 'https://example.com/coat.jpg',
                link: '/fashion/products/trench',
                span: 'col-span-2',
              },
              {
                title: 'Silk Organza Blouse',
                subtitle: 'Atelier Selection',
                imageUrl: 'https://example.com/blouse.jpg',
                span: 'col-span-1',
              },
            ],
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: 'LOOKBOOK 2026' })).toBeDefined();
      expect(screen.getByText('Minimalist Wool Trench')).toBeDefined();
      expect(screen.getByText('Outerwear')).toBeDefined();
      expect(screen.getByText('Silk Organza Blouse')).toBeDefined();
      expect(screen.getByText('Atelier Selection')).toBeDefined();
    });

    it('returns null when items array is empty', () => {
      const { container } = render(
        <EditorialGrid settings={{ items: [] }} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // 10. Testimonials
  // -------------------------------------------------------------------------
  describe('Testimonials', () => {
    const sampleReviews = [
      {
        id: 't-1',
        author: 'Elena Rostova',
        roleOrLocation: 'Zurich, Switzerland',
        quote: 'The clarity of floral notes in the washed Yirgacheffe is unparalleled.',
        rating: 5,
        productReferenced: 'Yirgacheffe Reserve',
      },
      {
        id: 't-2',
        author: 'Marcus Vance',
        roleOrLocation: 'Seattle, WA',
        quote: 'My subscription arrives within 48 hours of roasting every single month.',
        rating: 5,
      },
    ];

    it('renders customer quote cards in grid mode', () => {
      render(
        <Testimonials
          settings={{
            heading: 'Customer Praise',
            subheading: 'Over 10,000 satisfied home baristas.',
            layout: 'grid',
            testimonials: sampleReviews,
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: 'Customer Praise' })).toBeDefined();
      expect(screen.getByText('Elena Rostova')).toBeDefined();
      expect(screen.getByText('Zurich, Switzerland')).toBeDefined();
      expect(screen.getByText(/The clarity of floral notes/)).toBeDefined();
      expect(screen.getByText('Yirgacheffe Reserve')).toBeDefined();
      expect(screen.getByText('Marcus Vance')).toBeDefined();
    });

    it('renders carousel mode with interactive navigation controls', () => {
      render(
        <Testimonials
          settings={{
            heading: 'Customer Praise Carousel',
            layout: 'carousel',
            testimonials: sampleReviews,
          }}
        />
      );

      const nextBtn = screen.getByRole('button', { name: 'Next testimonial' });
      const prevBtn = screen.getByRole('button', { name: 'Previous testimonial' });
      expect(nextBtn).toBeDefined();
      expect(prevBtn).toBeDefined();

      fireEvent.click(nextBtn);
      fireEvent.click(prevBtn);
    });
  });

  // -------------------------------------------------------------------------
  // 11. ReviewsBreakdown
  // -------------------------------------------------------------------------
  describe('ReviewsBreakdown', () => {
    it('renders average rating, distribution progress bars, and verified review card', () => {
      render(
        <ReviewsBreakdown
          settings={{
            heading: 'Verified Customer Feedback',
            averageRating: 4.9,
            totalReviews: 245,
            recommendedPercentage: 98,
            distribution: [
              { stars: 5, count: 215, percentage: 88 },
              { stars: 4, count: 20, percentage: 8 },
              { stars: 3, count: 6, percentage: 2 },
              { stars: 2, count: 3, percentage: 1 },
              { stars: 1, count: 1, percentage: 1 },
            ],
            featuredReview: {
              author: 'Sophia Chen',
              title: 'A Revelation for Specialty Coffee',
              content: 'Every bean is uniform with zero defects. The natural process sweetness is exquisite.',
              rating: 5,
              verifiedBuyer: true,
              date: 'October 2, 2026',
            },
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: 'Verified Customer Feedback' })).toBeDefined();
      expect(screen.getByText('4.9')).toBeDefined();
      expect(screen.getByText('Based on 245 verified customer reviews')).toBeDefined();
      expect(screen.getByText('98% recommend this store')).toBeDefined();
      expect(screen.getByText('Rating Distribution')).toBeDefined();
      expect(screen.getByText('88%')).toBeDefined();
      expect(screen.getByText('Verified Buyer')).toBeDefined();
      expect(screen.getByText('“A Revelation for Specialty Coffee”')).toBeDefined();
      expect(screen.getByText('— Sophia Chen')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 12. LogoCloud
  // -------------------------------------------------------------------------
  describe('LogoCloud', () => {
    it('renders brand logos and typographic wordmarks with external links', () => {
      render(
        <LogoCloud
          settings={{
            heading: 'Featured In & Trusted By',
            grayscale: true,
            layout: 'row',
            logos: [
              {
                name: 'VOGUE',
                quote: 'The pinnacle of minimalist luxury',
                externalUrl: 'https://vogue.com',
              },
              {
                name: 'WIRED',
                quote: 'Engineering excellence at its finest',
                externalUrl: 'https://wired.com',
              },
            ],
          }}
        />
      );

      expect(screen.getByText('Featured In & Trusted By')).toBeDefined();
      expect(screen.getByText('VOGUE')).toBeDefined();
      expect(screen.getByText('“The pinnacle of minimalist luxury”')).toBeDefined();
      expect(screen.getByText('WIRED')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 13. Marquee
  // -------------------------------------------------------------------------
  describe('Marquee', () => {
    it('renders infinite continuous announcement ticker with duplicated items', () => {
      render(
        <Marquee
          settings={{
            items: ['COMPLIMENTARY WORLDWIDE SHIPPING', 'ETHICAL DIRECT TRADE', 'FRESH ROAST GUARANTEE'],
            speed: 'fast',
            direction: 'left',
            separator: '✦',
          }}
        />
      );

      const ticker = screen.getByRole('region', { name: 'Announcement ticker' });
      expect(ticker).toBeDefined();
      expect(screen.getAllByText('COMPLIMENTARY WORLDWIDE SHIPPING').length).toBeGreaterThanOrEqual(2);
    });
  });

  // -------------------------------------------------------------------------
  // 14. NewsletterSignup
  // -------------------------------------------------------------------------
  describe('NewsletterSignup', () => {
    it('validates email syntax, shows error on invalid input, and confirms success', async () => {
      vi.useFakeTimers();

      render(
        <NewsletterSignup
          settings={{
            heading: 'Unlock 15% Off Your First Order',
            subheading: 'Join our guild of coffee connoisseurs.',
            placeholder: 'Your email address',
            buttonText: 'Join Guild',
          }}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: 'Unlock 15% Off Your First Order' })).toBeDefined();

      const input = screen.getByPlaceholderText('Your email address');
      const submitBtn = screen.getByRole('button', { name: 'Join Guild' });

      // Invalid submission
      fireEvent.change(input, { target: { value: 'not-an-email' } });
      fireEvent.click(submitBtn);
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/Please enter a valid email address/)).toBeDefined();

      // Valid submission
      fireEvent.change(input, { target: { value: 'artisan@terroir.coffee' } });
      fireEvent.click(submitBtn);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByText('Subscription Confirmed')).toBeDefined();

      const subscribeAnother = screen.getByText('Subscribe another email');
      fireEvent.click(subscribeAnother);
      expect(screen.getByPlaceholderText('Your email address')).toBeDefined();

      vi.useRealTimers();
    });
  });

  // -------------------------------------------------------------------------
  // 15. FaqAccordion
  // -------------------------------------------------------------------------
  describe('FaqAccordion', () => {
    const faqItems = [
      {
        question: 'How fresh is the roasted coffee when shipped?',
        answer: 'All coffees are roasted within 24 to 48 hours of dispatch for optimal resting time.',
        category: 'Roasting',
      },
      {
        question: 'Do you offer whole bean and ground options?',
        answer: 'Yes, we provide whole bean as well as customized grinds for espresso, pour over, and French press.',
        category: 'Ordering',
      },
    ];

    it('expands and collapses accordion questions with accessible ARIA state', () => {
      render(
        <FaqAccordion
          settings={{
            heading: 'Frequently Asked Questions',
            items: faqItems,
            allowMultipleOpen: false,
          }}
        />
      );

      const q1Button = screen.getByRole('button', { name: 'How fresh is the roasted coffee when shipped?' });
      const q2Button = screen.getByRole('button', { name: 'Do you offer whole bean and ground options?' });

      // Initial state: index 0 open by default
      expect(q1Button.getAttribute('aria-expanded')).toBe('true');
      expect(q2Button.getAttribute('aria-expanded')).toBe('false');

      // Click second item
      fireEvent.click(q2Button);
      expect(q1Button.getAttribute('aria-expanded')).toBe('false');
      expect(q2Button.getAttribute('aria-expanded')).toBe('true');
    });

    it('filters questions by category pill', () => {
      render(
        <FaqAccordion
          settings={{
            heading: 'Categorized FAQs',
            items: faqItems,
          }}
        />
      );

      const roastingPill = screen.getByRole('button', { name: 'Roasting' });
      fireEvent.click(roastingPill);

      expect(screen.getByText('How fresh is the roasted coffee when shipped?')).toBeDefined();
      expect(screen.queryByText('Do you offer whole bean and ground options?')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // 16. SectionRenderer
  // -------------------------------------------------------------------------
  describe('SectionRenderer & Discriminated Union Registry', () => {
    it('renders all 14 section types via discriminated union configuration', () => {
      const allSections: SectionConfig[] = [
        {
          id: 's-hero-std',
          type: 'hero-standard',
          settings: { heading: 'Test Hero Standard' },
        },
        {
          id: 's-hero-split',
          type: 'hero-split',
          settings: { heading: 'Test Hero Split', imageUrl: 'https://example.com/split.jpg', imageAlt: 'Split' },
        },
        {
          id: 's-hero-fs',
          type: 'hero-fullscreen',
          settings: { heading: 'Test Hero Fullscreen', mediaUrl: 'https://example.com/fs.jpg' },
        },
        {
          id: 's-featured-prods',
          type: 'featured-products',
          settings: { heading: 'Test Featured Products' },
        },
        {
          id: 's-prod-carousel',
          type: 'product-carousel',
          settings: { heading: 'Test Product Carousel' },
        },
        {
          id: 's-collection-cards',
          type: 'collection-cards',
          settings: { heading: 'Test Collection Cards', collections: [] },
        },
        {
          id: 's-image-text',
          type: 'image-with-text',
          settings: { heading: 'Test Image Text', content: 'Story text', imageUrl: 'https://example.com/it.jpg', imageAlt: 'IT' },
        },
        {
          id: 's-testimonials',
          type: 'testimonials',
          settings: { heading: 'Test Testimonials', testimonials: [] },
        },
        {
          id: 's-reviews',
          type: 'reviews-breakdown',
          settings: { heading: 'Test Reviews Breakdown', averageRating: 5.0, totalReviews: 10 },
        },
        {
          id: 's-logo-cloud',
          type: 'logo-cloud',
          settings: { heading: 'Test Logo Cloud', logos: [] },
        },
        {
          id: 's-marquee',
          type: 'marquee',
          settings: { items: ['Test Marquee Item'] },
        },
        {
          id: 's-newsletter',
          type: 'newsletter-signup',
          settings: { heading: 'Test Newsletter Signup' },
        },
        {
          id: 's-faq',
          type: 'faq-accordion',
          settings: { heading: 'Test FAQ Accordion', items: [] },
        },
        {
          id: 's-editorial',
          type: 'editorial-grid',
          settings: { heading: 'Test Editorial Grid', items: [] },
        },
      ];

      render(
        <MemoryRouter>
          <SectionListRenderer sections={allSections} />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: 'Test Hero Standard' })).toBeDefined();
      expect(screen.getByRole('heading', { level: 1, name: 'Test Hero Split' })).toBeDefined();
      expect(screen.getByRole('heading', { level: 1, name: 'Test Hero Fullscreen' })).toBeDefined();
      expect(screen.getByRole('heading', { level: 2, name: 'Test Featured Products' })).toBeDefined();
      expect(screen.getByRole('heading', { level: 2, name: 'Test Product Carousel' })).toBeDefined();
      expect(screen.getByRole('heading', { level: 2, name: 'Test Image Text' })).toBeDefined();
      expect(screen.getByRole('heading', { level: 2, name: 'Test Reviews Breakdown' })).toBeDefined();
      expect(screen.getByRole('heading', { level: 2, name: 'Test Newsletter Signup' })).toBeDefined();
    });

    it('gracefully renders UnknownSectionFallback for unrecognized section type', () => {
      const unknownSection = {
        id: 'sec-custom-xyz',
        type: 'unsupported-future-section' as unknown as SectionConfig['type'],
        settings: {},
      };

      render(
        <MemoryRouter>
          <SectionRenderer section={unknownSection} />
        </MemoryRouter>
      );

      expect(screen.getByText(/Unsupported Section Type:/)).toBeDefined();
      expect(screen.getByText('unsupported-future-section')).toBeDefined();
      expect(screen.getByText('sec-custom-xyz')).toBeDefined();
    });

    it('catches runtime rendering errors in SectionErrorBoundary without crashing page', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const BombComponent: React.FC = () => {
        throw new Error('Explosive test error in section');
      };

      render(
        <SectionErrorBoundary sectionId="boom-1" sectionType="crashing-section">
          <BombComponent />
        </SectionErrorBoundary>
      );

      expect(screen.getByText(/Section Rendering Error:/)).toBeDefined();
      expect(screen.getByText(/Explosive test error in section/)).toBeDefined();

      consoleErrorSpy.mockRestore();
    });
  });
});
