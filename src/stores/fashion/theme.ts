import { StoreConfig } from '../../types/store';

export const fashionThemeConfig: StoreConfig = {
  id: 'fashion',
  name: 'Atelier Noir',
  tagline: 'Minimalist silhouettes crafted with architectural precision',
  industry: 'fashion',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 100.0,
  standardShippingRate: 10.0,
  taxRate: 0.08,
  theme: {
    colors: {
      primary: '#0A0A0A',
      secondary: '#262626',
      accent: '#E5E5E5',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#0A0A0A',
      textMuted: '#737373',
      border: '#E5E5E5',
    },
    typography: {
      headingFont: 'Syne, sans-serif',
      bodyFont: 'Inter, sans-serif',
      scale: 'expressive',
    },
    shape: {
      borderRadius: 'none',
      cardStyle: 'bordered',
    },
    layout: {
      headerStyle: 'left-aligned',
      heroVariant: 'fullscreen',
      contentDensity: 'spacious',
    },
    animation: {
      intensity: 'cinematic',
    },
  },
  sections: [
    {
      id: 'fashion-hero',
      type: 'hero-fullscreen',
      settings: {
        heading: 'AUTUMN / WINTER 2026',
        subheading: 'Architectural tailoring, stark monochrome silhouettes, and pure virgin wool drapery for the progressive wardrobe.',
        eyebrow: 'NEW COLLECTION CAPSULE',
        primaryCtaText: 'Explore Collection',
        primaryCtaLink: '/fashion/collections/outerwear',
        mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80',
        overlayOpacity: 0.35,
        textPosition: 'bottom-left',
        scrollIndicator: true,
      },
    },
    {
      id: 'fashion-editorial',
      type: 'editorial-grid',
      settings: {
        heading: 'The Monochrome Edit',
        subheading: 'Sculptural forms and raw Japanese selvedge foundations',
        items: [
          {
            title: 'Structured Virgin Wool',
            subtitle: 'Unconstructed double-breasted tailoring',
            imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
            link: '/fashion/collections/outerwear',
            span: 'col-span-2',
          },
          {
            title: 'Brutalist Footwear',
            subtitle: 'Lug-sole calfskin derbies',
            imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80',
            link: '/fashion/collections/footwear',
            span: 'col-span-1',
          },
          {
            title: 'Heavyweight Knitwear',
            subtitle: 'Seamless Mongolian cashmere',
            imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
            link: '/fashion/collections/knitwear',
            span: 'col-span-1',
          },
        ],
      },
    },
    {
      id: 'fashion-featured',
      type: 'featured-products',
      settings: {
        heading: 'Key Pieces',
        subheading: 'Foundational wardrobe garments engineered for permanence and form',
        limit: 4,
        columns: 4,
        viewAllText: 'View All Pieces',
        viewAllLink: '/fashion/collections/tailoring',
      },
    },
    {
      id: 'fashion-collections',
      type: 'collection-cards',
      settings: {
        heading: 'Curated Categories',
        subheading: 'Explore our specialized garment ateliers',
        columns: 4,
        aspectRatio: 'portrait',
        collections: [
          {
            handle: 'outerwear',
            title: 'Outerwear',
            imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=80',
            itemCountText: '4 Styles',
            description: 'Double-breasted coats and technical parkas',
          },
          {
            handle: 'tailoring',
            title: 'Tailoring',
            imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
            itemCountText: '4 Styles',
            description: 'Deconstructed blazers and wide-leg trousers',
          },
          {
            handle: 'knitwear',
            title: 'Knitwear',
            imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
            itemCountText: '4 Styles',
            description: 'Seamless cashmere and ribbed turtlenecks',
          },
          {
            handle: 'footwear',
            title: 'Footwear',
            imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
            itemCountText: '4 Styles',
            description: 'Brutalist calfskin boots and derby shoes',
          },
        ],
      },
    },
    {
      id: 'fashion-marquee',
      type: 'marquee',
      settings: {
        items: [
          'COMPLIMENTARY GLOBAL EXPRESS SHIPPING OVER $100',
          'HANDMADE IN MILAN & KYOTO',
          'ZERO-WASTE RECYCLED VIRGIN WOOL',
          'BESPOKE PRIVATE CLIENT SALON',
        ],
        speed: 'slow',
      },
    },
    {
      id: 'fashion-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Join The Private Atelier List',
        subheading: 'Receive advance private access to limited capsule releases, runway previews, and tailoring appointments.',
        placeholder: 'Enter your email address',
        buttonText: 'Request Access',
        disclaimerText: 'Strictly limited correspondence. We respect your digital sanctuary.',
        successMessage: 'You are on the atelier guest list. Welcome.',
      },
    },
  ],
  navigation: [
    { label: 'Outerwear', href: '/fashion/collections/outerwear' },
    { label: 'Tailoring', href: '/fashion/collections/tailoring' },
    { label: 'Knitwear', href: '/fashion/collections/knitwear' },
    { label: 'Footwear', href: '/fashion/collections/footwear' },
  ],
};

export default fashionThemeConfig;
