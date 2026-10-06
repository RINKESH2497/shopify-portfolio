import { StoreConfig } from '../../types/store';

export const jewelryThemeConfig: StoreConfig = {
  id: 'jewelry',
  name: "L'Étoile Joaillerie",
  tagline: 'Haute horlogerie and timeless fine jewelry handcrafted in Paris',
  industry: 'jewelry',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 200.0,
  standardShippingRate: 15.0,
  taxRate: 0.08,
  theme: {
    colors: {
      primary: '#C5A059',
      secondary: '#1A1815',
      accent: '#DFBD78',
      background: '#0D0C0A',
      surface: '#1E1C18',
      text: '#FAF7F2',
      textMuted: '#A39988',
      border: '#3D372E',
    },
    typography: {
      headingFont: 'Cormorant Garamond, serif',
      bodyFont: 'Montserrat, sans-serif',
      scale: 'normal',
    },
    shape: {
      borderRadius: 'md',
      cardStyle: 'elevated',
    },
    layout: {
      headerStyle: 'transparent-overlay',
      heroVariant: 'standard',
      contentDensity: 'spacious',
    },
    animation: {
      intensity: 'smooth',
    },
  },
  sections: [
    {
      id: 'jewelry-hero',
      type: 'hero-standard',
      settings: {
        heading: 'The High Jewelry Collection',
        subheading: 'Rare diamond solitaires, untreated sapphires, and solid 18k gold handcrafted on Place Vendôme.',
        eyebrow: 'MAISON DE HAUTE JOAILLERIE PARIS',
        primaryCtaText: 'Discover Masterpieces',
        primaryCtaLink: '/jewelry/collections/high-jewelry',
        secondaryCtaText: 'Book Private Salon',
        secondaryCtaLink: '/jewelry/collections/rings',
        backgroundImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
        overlayOpacity: 0.7,
        textAlignment: 'center',
        badgeText: 'PARIS • EST. 1924',
      },
    },
    {
      id: 'jewelry-featured',
      type: 'featured-products',
      settings: {
        heading: 'Masterpiece Creations',
        subheading: 'Each piece is uniquely hallmarked and accompanied by independent GIA certificates',
        limit: 4,
        columns: 4,
        viewAllText: 'Explore All Creations',
        viewAllLink: '/jewelry/collections/high-jewelry',
      },
    },
    {
      id: 'jewelry-story',
      type: 'image-with-text',
      settings: {
        heading: 'Generations of Craftsmanship',
        eyebrow: 'ATELIER HERITAGE',
        content: 'For over a century, our master lapidaries and jewelers have sculpted treasures from conflict-free natural diamonds, untreated Ceylon sapphires, and recycled 18k solid gold. Every setting is hand-clawed to optimize light transmission and dispersion.',
        imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
        imageAlt: 'Master jeweler setting diamond into 18k gold ring using precision optical microscope',
        imagePosition: 'right',
        ctaText: 'Discover Our Maison',
        ctaLink: '/jewelry/collections/high-jewelry',
        statHighlight: {
          value: '100 Yrs',
          label: 'Of Continuous Parisian Jewelry Artistry',
        },
      },
    },
    {
      id: 'jewelry-reviews',
      type: 'reviews-breakdown',
      settings: {
        heading: 'Connoisseur Ratings & Testimonials',
        averageRating: 4.9,
        totalReviews: 128,
        recommendedPercentage: 99,
        distribution: [
          { stars: 5, count: 118, percentage: 92 },
          { stars: 4, count: 9, percentage: 7 },
          { stars: 3, count: 1, percentage: 1 },
          { stars: 2, count: 0, percentage: 0 },
          { stars: 1, count: 0, percentage: 0 },
        ],
        featuredReview: {
          author: 'Countess Genevieve de Saint-Germain',
          title: 'Unrivaled Fire and Optical Purity',
          content: 'The Solitaire Constellation ring exceeded my highest expectations. The claw setting is gossamer thin, allowing light to flood through the pavilion. Truly museum quality craftsmanship.',
          rating: 5,
          verifiedBuyer: true,
          date: '2026-02-14',
        },
      },
    },
    {
      id: 'jewelry-faq',
      type: 'faq-accordion',
      settings: {
        heading: 'Bespoke Inquiries & Diamond Certification',
        subheading: 'Answers regarding gemstone provenance, sizing appointments, and insured white-glove delivery.',
        items: [
          {
            question: 'Are all diamonds independently GIA certified?',
            answer: 'Yes. Every diamond exceeding 0.50 carats is accompanied by an original Gemological Institute of America (GIA) grading dossier, detailing laser-inscribed girdle identification, 4Cs analysis, and optical proportions.',
            category: 'Certification',
          },
          {
            question: 'Do you offer custom sizing and bespoke ring engraving?',
            answer: 'Complimentary bespoke resizing and French cursive inside-band laser engraving are provided on all ring commissions. Sizing kits can be dispatched to your residence upon request.',
            category: 'Bespoke',
          },
          {
            question: 'How are high-value jewelry orders delivered?',
            answer: 'All domestic and international parcels are dispatched via armoured courier (Ferrari Security / Brinks) with 100% full-value transit insurance and direct signature verification required.',
            category: 'Delivery',
          },
        ],
        allowMultipleOpen: false,
      },
    },
    {
      id: 'jewelry-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Private Salon Invitations',
        subheading: 'Subscribe to receive private preview invitations, high jewelry collection catalogs, and bespoke gemstone acquisition advisories.',
        placeholder: 'Enter your private email',
        buttonText: 'Request Invitation',
        disclaimerText: 'Strict discretion assured. Encrypted correspondence.',
        successMessage: 'Your private salon invitation has been dispatched to your email.',
      },
    },
  ],
  navigation: [
    { label: 'Necklaces', href: '/jewelry/collections/necklaces' },
    { label: 'Rings', href: '/jewelry/collections/rings' },
    { label: 'Earrings', href: '/jewelry/collections/earrings' },
    { label: 'High Jewelry', href: '/jewelry/collections/high-jewelry' },
  ],
};

export default jewelryThemeConfig;
