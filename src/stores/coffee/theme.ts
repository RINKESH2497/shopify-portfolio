import { StoreConfig } from '../../types/store';

export const coffeeThemeConfig: StoreConfig = {
  id: 'coffee',
  name: 'Terroir & Roast',
  tagline: 'Single-origin beans roasted to perfection in small batches',
  industry: 'coffee',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 50.0,
  standardShippingRate: 5.0,
  taxRate: 0.08,
  theme: {
    colors: {
      primary: '#2C1810',
      secondary: '#8B5A2B',
      accent: '#D4A373',
      background: '#FAEDCD',
      surface: '#FEFAE0',
      text: '#2C1810',
      textMuted: '#6B4423',
      border: '#E9D8A6',
    },
    typography: {
      headingFont: 'Fraunces, serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
      scale: 'expressive',
    },
    shape: {
      borderRadius: '2xl',
      cardStyle: 'flat',
    },
    layout: {
      headerStyle: 'centered',
      heroVariant: 'split',
      contentDensity: 'comfortable',
    },
    animation: {
      intensity: 'smooth',
    },
  },
  sections: [
    {
      id: 'coffee-hero',
      type: 'hero-split',
      settings: {
        heading: 'Craft Roasted In Small Batches',
        subheading: 'Ethically sourced single-origin coffees from micro-lot farms across Ethiopia, Colombia, and Guatemala.',
        tagline: 'Artisanal Micro-Roastery',
        primaryCtaText: 'Shop Harvest',
        primaryCtaLink: '/coffee/collections/single-origin',
        secondaryCtaText: 'Our Story',
        secondaryCtaLink: '#story',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'Artisan pour-over coffee preparation in ceramic dripper',
        imagePosition: 'right',
        stats: [
          { label: 'Direct Trade Premium', value: '+40%' },
          { label: 'Micro-Lot Cooperatives', value: '18' },
          { label: 'Q-Grader Cup Score', value: '88+' },
        ],
      },
    },
    {
      id: 'coffee-marquee',
      type: 'marquee',
      settings: {
        items: [
          'Free Shipping Over $50',
          'Ethically Sourced Micro-Lots',
          'Direct Trade Guaranteed',
          'Roasted Fresh Weekly',
          '100% Biodegradable Packaging',
        ],
        speed: 'normal',
      },
    },
    {
      id: 'coffee-featured',
      type: 'featured-products',
      settings: {
        heading: 'Seasonal Harvest',
        subheading: 'Freshly roasted micro-lots from our partner cooperatives in high-altitude volcanic soils',
        limit: 4,
        columns: 4,
        viewAllText: 'Explore All Coffees',
        viewAllLink: '/coffee/collections/single-origin',
      },
    },
    {
      id: 'coffee-story',
      type: 'image-with-text',
      settings: {
        heading: 'From Soil to Cup',
        eyebrow: 'Direct Trade Philosophy',
        content: 'We partner directly with sustainable micro-lot farmers across high-altitude regions, paying well above fair-trade minimums to support regenerative agriculture, soil restoration, and multi-generational farmer cooperatives.',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
        imageAlt: 'Sun-drenched coffee bean drying patio on an organic mountain farm',
        imagePosition: 'left',
        ctaText: 'Learn About Our Farmers',
        ctaLink: '/coffee/collections/single-origin',
        statHighlight: {
          value: '100%',
          label: 'Traceable to Single Origin Washing Stations',
        },
      },
    },
    {
      id: 'coffee-carousel',
      type: 'product-carousel',
      settings: {
        heading: 'Barista Favorites',
        subheading: 'Award-winning roasts and precision brew gear chosen by our head roaster',
        showArrows: true,
        showDots: true,
      },
    },
    {
      id: 'coffee-testimonials',
      type: 'testimonials',
      settings: {
        heading: 'What Coffee Lovers Say',
        subheading: 'Experiences from our community of dedicated home brewers and specialty cafes',
        testimonials: [
          {
            id: 'testimonial-c1',
            author: 'Marcus Vance',
            roleOrLocation: 'Specialty Coffee Guild Barista',
            quote: 'The Ethiopian Yirgacheffe is effortlessly complex — jasmine florals followed by bergamot and a honeyed peach finish. The roast curve is executed to absolute perfection.',
            rating: 5,
            productReferenced: 'Ethiopian Yirgacheffe Single Origin',
          },
          {
            id: 'testimonial-c2',
            author: 'Elena Rostova',
            roleOrLocation: 'Home Brewer, Seattle',
            quote: 'Switching to Terroir & Roast transformed my morning routine. Knowing the beans were roasted three days before arriving at my door makes all the difference in extraction.',
            rating: 5,
            productReferenced: 'Signature Espresso Bar Blend',
          },
          {
            id: 'testimonial-c3',
            author: 'Julian Thorne',
            roleOrLocation: 'Cafe Owner, Portland',
            quote: 'Their Colombian Supremo reserve yields the richest crema and smoothest caramel notes our customers have ever tasted. Truly exceptional micro-lot curation.',
            rating: 5,
            productReferenced: 'Colombian Supremo Reserve',
          },
        ],
      },
    },
    {
      id: 'coffee-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Join The Coffee Fellowship',
        subheading: 'Receive fresh harvest releases, roaster notes, brew guides, and 10% off your initial roast order.',
        placeholder: 'Enter your email for 10% off',
        buttonText: 'Subscribe',
        disclaimerText: 'We respect your privacy. Unsubscribe at any time with one click.',
        successMessage: 'Welcome to the fellowship! Check your inbox for your 10% discount code.',
      },
    },
  ],
  navigation: [
    { label: 'Single Origin', href: '/coffee/collections/single-origin' },
    { label: 'Blends', href: '/coffee/collections/blends' },
    { label: 'Brew Gear', href: '/coffee/collections/brew-gear' },
    { label: 'Subscriptions', href: '/coffee/collections/subscriptions' },
  ],
};

export default coffeeThemeConfig;
