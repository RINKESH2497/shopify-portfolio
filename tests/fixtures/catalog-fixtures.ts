/**
 * Authoritative Synthetic Store Fixtures for 4 Demo Stores
 * Generated according to specifications in PROJECT.md and ORIGINAL_REQUEST.md.
 */

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  options: Record<string, string>;
  availableForSale: boolean;
  inventoryQuantity: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  tags: string[];
  images: { id: string; url: string; altText: string; width?: number; height?: number }[];
  options: { name: string; values: string[] }[];
  variants: ProductVariant[];
  rating: { average: number; count: number };
  specifications?: Record<string, string>;
  featured?: boolean;
  createdAt?: string;
}

export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    scale: 'compact' | 'normal' | 'expressive';
  };
  shape: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    cardStyle: 'flat' | 'bordered' | 'elevated' | 'glassmorphic';
  };
  layout: {
    headerStyle: 'centered' | 'left-aligned' | 'transparent-overlay' | 'tech-hud';
    heroVariant: 'standard' | 'split' | 'fullscreen';
    contentDensity: 'spacious' | 'comfortable' | 'dense';
  };
  animation: {
    intensity: 'subtle' | 'smooth' | 'snappy' | 'cinematic';
  };
}

export interface SectionConfig {
  id: string;
  type:
    | 'hero-standard'
    | 'hero-split'
    | 'hero-fullscreen'
    | 'featured-products'
    | 'product-carousel'
    | 'collection-cards'
    | 'image-with-text'
    | 'testimonials'
    | 'reviews-breakdown'
    | 'logo-cloud'
    | 'marquee'
    | 'newsletter-signup'
    | 'faq-accordion'
    | 'editorial-grid';
  settings: Record<string, any>;
}

export interface StoreConfig {
  id: string;
  name: string;
  tagline: string;
  industry: 'coffee' | 'fashion' | 'jewelry' | 'electronics';
  currency: string;
  currencySymbol: string;
  theme: ThemeTokens;
  sections: SectionConfig[];
  navigation: { label: string; href: string }[];
  freeShippingThreshold: number;
  standardShippingRate: number;
  taxRate: number;
}

// -------------------------------------------------------------
// STORE CONFIGS
// -------------------------------------------------------------

export const COFFEE_STORE_CONFIG: StoreConfig = {
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
      border: '#E9D8A6'
    },
    typography: {
      headingFont: 'Fraunces, serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
      scale: 'expressive'
    },
    shape: {
      borderRadius: '2xl',
      cardStyle: 'bordered'
    },
    layout: {
      headerStyle: 'centered',
      heroVariant: 'split',
      contentDensity: 'comfortable'
    },
    animation: {
      intensity: 'smooth'
    }
  },
  sections: [
    { id: 's-hero', type: 'hero-split', settings: { headline: 'Craft Roasted In Small Batches' } },
    { id: 's-marquee', type: 'marquee', settings: { text: 'Free Shipping Over $50 • Ethically Sourced • Direct Trade' } },
    { id: 's-featured', type: 'featured-products', settings: { title: 'Seasonal Harvest' } },
    { id: 's-story', type: 'image-with-text', settings: { layout: 'image-left', title: 'From Soil to Cup' } },
    { id: 's-carousel', type: 'product-carousel', settings: { title: 'Barista Favorites' } },
    { id: 's-testimonials', type: 'testimonials', settings: { title: 'What Coffee Lovers Say' } },
    { id: 's-newsletter', type: 'newsletter-signup', settings: { placeholder: 'Enter your email for 10% off' } }
  ],
  navigation: [
    { label: 'Single Origin', href: '/coffee/collections/single-origin' },
    { label: 'Blends', href: '/coffee/collections/blends' },
    { label: 'Brew Gear', href: '/coffee/collections/brew-gear' },
    { label: 'Subscriptions', href: '/coffee/collections/subscriptions' }
  ]
};

export const FASHION_STORE_CONFIG: StoreConfig = {
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
      border: '#E5E5E5'
    },
    typography: {
      headingFont: 'Syne, sans-serif',
      bodyFont: 'Inter, sans-serif',
      scale: 'expressive'
    },
    shape: {
      borderRadius: 'none',
      cardStyle: 'flat'
    },
    layout: {
      headerStyle: 'left-aligned',
      heroVariant: 'fullscreen',
      contentDensity: 'spacious'
    },
    animation: {
      intensity: 'cinematic'
    }
  },
  sections: [
    { id: 's-hero', type: 'hero-fullscreen', settings: { headline: 'AUTUMN / WINTER 2026' } },
    { id: 's-editorial', type: 'editorial-grid', settings: { title: 'The Monochrome Edit' } },
    { id: 's-featured', type: 'featured-products', settings: { title: 'Key Pieces' } },
    { id: 's-collections', type: 'collection-cards', settings: { title: 'Curated Categories' } },
    { id: 's-marquee', type: 'marquee', settings: { text: 'COMPLIMENTARY GLOBAL SHIPPING OVER $100 • EXPRESS COURIER' } },
    { id: 's-newsletter', type: 'newsletter-signup', settings: { placeholder: 'Join the private atelier list' } }
  ],
  navigation: [
    { label: 'Outerwear', href: '/fashion/collections/outerwear' },
    { label: 'Tailoring', href: '/fashion/collections/tailoring' },
    { label: 'Knitwear', href: '/fashion/collections/knitwear' },
    { label: 'Footwear', href: '/fashion/collections/footwear' }
  ]
};

export const JEWELRY_STORE_CONFIG: StoreConfig = {
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
      border: '#3D372E'
    },
    typography: {
      headingFont: 'Cormorant Garamond, serif',
      bodyFont: 'Montserrat, sans-serif',
      scale: 'normal'
    },
    shape: {
      borderRadius: 'md',
      cardStyle: 'bordered'
    },
    layout: {
      headerStyle: 'transparent-overlay',
      heroVariant: 'standard',
      contentDensity: 'spacious'
    },
    animation: {
      intensity: 'smooth'
    }
  },
  sections: [
    { id: 's-hero', type: 'hero-standard', settings: { headline: 'The High Jewelry Collection' } },
    { id: 's-featured', type: 'featured-products', settings: { title: 'Masterpiece Creations' } },
    { id: 's-story', type: 'image-with-text', settings: { layout: 'image-right', title: 'Generations of Craftsmanship' } },
    { id: 's-reviews', type: 'reviews-breakdown', settings: { title: 'Client Testimonials & Ratings' } },
    { id: 's-faq', type: 'faq-accordion', settings: { title: 'Bespoke Inquiries & Diamond Certification' } },
    { id: 's-newsletter', type: 'newsletter-signup', settings: { placeholder: 'Subscribe for private salon invitations' } }
  ],
  navigation: [
    { label: 'Necklaces', href: '/jewelry/collections/necklaces' },
    { label: 'Rings', href: '/jewelry/collections/rings' },
    { label: 'Earrings', href: '/jewelry/collections/earrings' },
    { label: 'High Jewelry', href: '/jewelry/collections/high-jewelry' }
  ]
};

export const ELECTRONICS_STORE_CONFIG: StoreConfig = {
  id: 'electronics',
  name: 'Nexus Tech',
  tagline: 'Next-generation computing hardware, audio engineering & robotics',
  industry: 'electronics',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 75.0,
  standardShippingRate: 8.0,
  taxRate: 0.08,
  theme: {
    colors: {
      primary: '#00E5FF',
      secondary: '#7C4DFF',
      accent: '#FF0055',
      background: '#0B0F19',
      surface: '#131B2E',
      text: '#E2E8F0',
      textMuted: '#94A3B8',
      border: '#1E293B'
    },
    typography: {
      headingFont: 'Space Grotesk, sans-serif',
      bodyFont: 'Inter, sans-serif',
      scale: 'compact'
    },
    shape: {
      borderRadius: 'sm',
      cardStyle: 'elevated'
    },
    layout: {
      headerStyle: 'tech-hud',
      heroVariant: 'standard',
      contentDensity: 'dense'
    },
    animation: {
      intensity: 'snappy'
    }
  },
  sections: [
    { id: 's-hero', type: 'hero-standard', settings: { headline: 'QUANTUM SPEED. ZERO LATENCY.' } },
    { id: 's-marquee', type: 'marquee', settings: { text: 'WIFI 7 CERTIFIED • 240HZ OLED DISPLAYS • NEXT-GEN SILICON' } },
    { id: 's-featured', type: 'featured-products', settings: { title: 'Flagship Hardware' } },
    { id: 's-carousel', type: 'product-carousel', settings: { title: 'Audio & Acoustics' } },
    { id: 's-logo-cloud', type: 'logo-cloud', settings: { title: 'Industry Partners' } },
    { id: 's-faq', type: 'faq-accordion', settings: { title: 'Technical Specifications & Warranty' } },
    { id: 's-newsletter', type: 'newsletter-signup', settings: { placeholder: 'Get dev telemetry updates' } }
  ],
  navigation: [
    { label: 'Displays', href: '/electronics/collections/displays' },
    { label: 'Audio', href: '/electronics/collections/audio' },
    { label: 'Peripherals', href: '/electronics/collections/peripherals' },
    { label: 'Computing', href: '/electronics/collections/computing' }
  ]
};

// -------------------------------------------------------------
// HELPER TO GENERATE 16 REALISTIC PRODUCTS PER STORE
// -------------------------------------------------------------

function generateProducts(storeId: string, count: number = 16): Product[] {
  const products: Product[] = [];

  const storeProfiles: Record<string, {
    categoryPrefix: string[];
    titles: string[];
    basePrice: number;
    optionsDef: { name: string; values: string[] }[];
    tags: string[];
  }> = {
    coffee: {
      categoryPrefix: ['Single Origin', 'Blends', 'Brew Gear', 'Espresso'],
      titles: [
        'Yirgacheffe Ethiopian Floral',
        'Huila Colombian Supremo',
        'Antigua Guatemalan Volcanic',
        'Sumatra Mandheling Dark Earth',
        'Kenya Nyeri Peaberry AA',
        'Costa Rica Tarrazu Honey Process',
        'Panama Geisha Reserve',
        'Velvet Velvet Espresso Blend',
        'Dawn Patrol Breakfast Roast',
        'Midnight Oil French Roast',
        'Cold Brew Coarse Steep Blend',
        'Decaf Mountain Water Chiapas',
        'Precision Burr Grinder 40mm',
        'Gooseneck Temperature Kettle',
        'Double Wall Glass Dripper',
        'Ceramic Cupping Bowl Set'
      ],
      basePrice: 18.0,
      optionsDef: [
        { name: 'Grind', values: ['Whole Bean', 'Espresso', 'Pour Over', 'French Press'] },
        { name: 'Weight', values: ['250g', '500g', '1kg'] }
      ],
      tags: ['single-origin', 'organic', 'direct-trade', 'arabica', 'fresh-roast']
    },
    fashion: {
      categoryPrefix: ['Outerwear', 'Tailoring', 'Knitwear', 'Footwear'],
      titles: [
        'Oversized Double-Breasted Wool Coat',
        'Deconstructed Architecture Blazer',
        'Wide-Leg Pleated Wool Trousers',
        'Heavyweight Merino Ribbed Turtleneck',
        'Raw Silk Minimalist Drape Shirt',
        'Structured Gabardine Trench',
        'Japanese Selvedge Denim Jean',
        'Seamless Cashmere Crewneck',
        'Chunky Lug-Sole Derby Shoe',
        'Brutalist Calfskin Chelsea Boot',
        'Sculptural Leather Tote Bag',
        'Cashmere Fringe Travel Wrap',
        'Asymmetrical Poplin Shirtdress',
        'Cropped Structured Bomber',
        'Technical Nylon Storm Parka',
        'Handcrafted Leather Belt'
      ],
      basePrice: 85.0,
      optionsDef: [
        { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] },
        { name: 'Color', values: ['Black', 'Charcoal', 'Bone White', 'Camel'] }
      ],
      tags: ['runway', 'minimalist', 'sustainable', 'luxury-basics', 'tailored']
    },
    jewelry: {
      categoryPrefix: ['Necklaces', 'Rings', 'Earrings', 'High Jewelry'],
      titles: [
        'Solitaire Diamond Constellation Ring',
        'Emerald Cut Colombian Sapphire Pendant',
        'Pavé Diamond Twisted Bangle',
        'Tahitian South Sea Pearl Earrings',
        'Art Deco Platinum Filigree Choker',
        'Baguette Eternity Wedding Band',
        'Cushion Cut Tanzanite Cocktail Ring',
        'Floating Diamond Tennis Bracelet',
        'Hammered 18K Yellow Gold Hoops',
        'Rose Gold Starlight Lariat Necklace',
        'Bespoke Marquise Diamond Ring',
        'Tourmaline & Akoya Pearl Brooch',
        'Vintage Crest Signet Ring',
        'Diamond Waterfall Drop Earrings',
        'Celestial Moonstone Amulet',
        'Briolette Sapphire Tiara Ring'
      ],
      basePrice: 240.0,
      optionsDef: [
        { name: 'Metal', values: ['14K Yellow Gold', '18K White Gold', 'Platinum', 'Rose Gold'] },
        { name: 'Size', values: ['5', '6', '7', '8', '9'] }
      ],
      tags: ['fine-jewelry', 'certified-diamond', 'handcrafted-paris', 'bespoke', 'ethical-gem']
    },
    electronics: {
      categoryPrefix: ['Displays', 'Audio', 'Peripherals', 'Computing'],
      titles: [
        'Quantum 34-inch 240Hz OLED Curved Monitor',
        'Sonic Pro ANC Planar Magnetic Headphones',
        'Cyberdeck Mechanical Hot-Swap Keyboard',
        'Precision 8000Hz Optical Wireless Mouse',
        'Studio Reference Active Nearfield Monitors',
        'Thunderbolt 5 Dual 8K Modular Dock',
        'Ergonomic Carbon Fiber Monitor Arm',
        'Audiophile High-Res USB-C DAC/Amp',
        'Ultra-Thin 4K Portable Creator OLED',
        'Broadcast Cardioid Dynamic XLR Microphone',
        'Titanium 100W GaN Travel Fast Charger',
        'MagSafe Quad-Device Floating Wireless Stand',
        'NVMe Gen5 PCIe 4TB Extreme Solid State Drive',
        'Smart Ambient Hue Studio LED Lightbar',
        'Lossless Bluetooth 5.4 Wireless IEMs',
        'Low-Profile Gasket Macro Keypad'
      ],
      basePrice: 99.0,
      optionsDef: [
        { name: 'Storage', values: ['128GB', '256GB', '512GB', '1TB'] },
        { name: 'Finish', values: ['Matte Black', 'Cyber Cyan', 'Titanium Grey'] }
      ],
      tags: ['flagship', 'pro-grade', 'gaming', 'wireless', 'high-res', 'low-latency']
    }
  };

  const profile = storeProfiles[storeId] || storeProfiles['coffee'];

  for (let i = 0; i < count; i++) {
    const title = profile.titles[i] || `Product ${i + 1}`;
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = profile.categoryPrefix[i % profile.categoryPrefix.length];
    const price = Math.round((profile.basePrice * (1 + (i * 0.15))) * 100) / 100;
    const compareAtPrice = (i % 3 === 0) ? Math.round((price * 1.25) * 100) / 100 : undefined;

    // Generate variants
    const variants: ProductVariant[] = [];
    const opt1 = profile.optionsDef[0];
    const opt2 = profile.optionsDef[1];

    let vIdx = 1;
    for (const v1 of opt1.values.slice(0, 3)) {
      for (const v2 of opt2.values.slice(0, 3)) {
        const variantPrice = Math.round((price + (vIdx * 2.5)) * 100) / 100;
        variants.push({
          id: `var-${storeId}-${i + 1}-${vIdx}`,
          title: `${v1} / ${v2}`,
          sku: `${storeId.toUpperCase()}-${i + 1}-SKU-${vIdx}`,
          price: variantPrice,
          compareAtPrice: compareAtPrice ? Math.round((variantPrice * 1.2) * 100) / 100 : undefined,
          options: {
            [opt1.name]: v1,
            [opt2.name]: v2
          },
          availableForSale: vIdx !== 5, // 5th variant intentionally simulated as out of stock for testing
          inventoryQuantity: vIdx === 5 ? 0 : 25 + (vIdx * 5),
          imageUrl: `https://images.unsplash.com/photo-${storeId}-${i + 1}-${vIdx}`
        });
        vIdx++;
      }
    }

    products.push({
      id: `prod-${storeId}-${i + 1}`,
      handle,
      title,
      subtitle: `Authentic crafted ${category}`,
      description: `High performance premium ${category} designed for enthusiasts of ${storeId}. Tested and verified for quality.`,
      price,
      compareAtPrice,
      category,
      tags: [...profile.tags, category.toLowerCase()],
      images: [
        {
          id: `img-${storeId}-${i + 1}-1`,
          url: `https://images.unsplash.com/photo-${storeId}-${i + 1}-1`,
          altText: `${title} main view`
        },
        {
          id: `img-${storeId}-${i + 1}-2`,
          url: `https://images.unsplash.com/photo-${storeId}-${i + 1}-2`,
          altText: `${title} alternate angle`
        }
      ],
      options: profile.optionsDef,
      variants,
      rating: {
        average: Math.round((4.0 + ((i % 10) * 0.1)) * 10) / 10,
        count: 12 + (i * 7)
      },
      specifications: storeId === 'electronics' ? {
        Connectivity: 'USB-C / BT 5.4 / 2.4GHz',
        Latency: '< 1ms Ultra Low',
        Warranty: '2-Year Limited Global'
      } : undefined,
      featured: i < 4,
      createdAt: new Date(2026, 0, 1 + i).toISOString()
    });
  }

  return products;
}

export const STORE_FIXTURES: Record<string, { config: StoreConfig; products: Product[] }> = {
  coffee: {
    config: COFFEE_STORE_CONFIG,
    products: generateProducts('coffee', 16)
  },
  fashion: {
    config: FASHION_STORE_CONFIG,
    products: generateProducts('fashion', 16)
  },
  jewelry: {
    config: JEWELRY_STORE_CONFIG,
    products: generateProducts('jewelry', 16)
  },
  electronics: {
    config: ELECTRONICS_STORE_CONFIG,
    products: generateProducts('electronics', 16)
  }
};
