import { StoreConfig } from '../../types/store';

export const electronicsThemeConfig: StoreConfig = {
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
      border: '#1E293B',
    },
    typography: {
      headingFont: 'Space Grotesk, sans-serif',
      bodyFont: 'Inter, sans-serif',
      scale: 'compact',
    },
    shape: {
      borderRadius: 'sm',
      cardStyle: 'glassmorphic',
    },
    layout: {
      headerStyle: 'tech-hud',
      heroVariant: 'split',
      contentDensity: 'dense',
    },
    animation: {
      intensity: 'snappy',
    },
  },
  sections: [
    {
      id: 'electronics-hero',
      type: 'hero-split',
      settings: {
        heading: 'QUANTUM SPEED. ZERO LATENCY.',
        subheading: 'Engineered for competitive esports and high-throughput workstation workflows. Powered by custom mechanical switches and lossless wireless architectures.',
        tagline: 'NEXT-GEN HARDWARE ARCHITECTURE',
        primaryCtaText: 'Shop Hardware',
        primaryCtaLink: '/electronics/collections/keyboards',
        secondaryCtaText: 'View Telemetry',
        secondaryCtaLink: '/electronics/collections/displays',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'High performance gaming workstation setup with cyber cyan illumination',
        imagePosition: 'right',
        stats: [
          { label: 'Polling Rate', value: '8000Hz' },
          { label: 'Wireless Latency', value: '< 0.5ms' },
          { label: 'Battery Runtime', value: '180h' },
        ],
      },
    },
    {
      id: 'electronics-marquee',
      type: 'marquee',
      settings: {
        items: [
          'WIFI 7 TRI-BAND CERTIFIED',
          '240HZ QD-OLED LOW PERSISTENCE',
          'NEXT-GEN NEURAL PROCESSING ENGINES',
          '< 0.5MS ULTRA LOW LATENCY WIRELESS',
          'AEROSPACE GRADE CNC BILLET ALUMINUM',
        ],
        speed: 'fast',
      },
    },
    {
      id: 'electronics-featured',
      type: 'featured-products',
      settings: {
        heading: 'Flagship Hardware',
        subheading: 'Benchmark-tested peripherals and workstation grade silicon components',
        limit: 4,
        columns: 4,
        viewAllText: 'Explore All Gear',
        viewAllLink: '/electronics/collections/keyboards',
      },
    },
    {
      id: 'electronics-carousel',
      type: 'product-carousel',
      settings: {
        heading: 'Audio & Acoustic Engineering',
        subheading: 'Planar magnetic studio reference monitors and active noise cancelling headsets',
        showArrows: true,
        showDots: true,
      },
    },
    {
      id: 'electronics-logos',
      type: 'logo-cloud',
      settings: {
        heading: 'Hardware Ecosystem Architecture Partners',
        logos: [
          { name: 'NVIDIA' },
          { name: 'Intel' },
          { name: 'AMD' },
          { name: 'Qualcomm' },
          { name: 'ARM' },
          { name: 'TSMC' },
        ],
        grayscale: true,
      },
    },
    {
      id: 'electronics-faq',
      type: 'faq-accordion',
      settings: {
        heading: 'Technical Specifications & Global Warranty',
        subheading: 'Direct engineering answers regarding firmware flashing, cross-platform compatibility, and warranty coverage.',
        items: [
          {
            question: 'What is the standard warranty on Nexus Tech hardware?',
            answer: 'All computing hardware, monitors, and peripherals are backed by our 2-Year Limited Global Advance-Replacement Warranty, including express cross-shipping of replacement units.',
            category: 'Warranty',
          },
          {
            question: 'Are keyboards and mice compatible with macOS and Linux?',
            answer: 'Yes. All hardware utilizes on-board flash memory profiles with cross-platform open-source web-based configuration via WebHID (no proprietary bloatware installation required).',
            category: 'Compatibility',
          },
          {
            question: 'What is the true tested latency of your wireless connection?',
            answer: 'Our proprietary 2.4GHz RF connection delivers an independently verified sub-0.5 millisecond click-to-photon latency with zero packet dropping even in dense wireless environments.',
            category: 'Performance',
          },
        ],
        allowMultipleOpen: false,
      },
    },
    {
      id: 'electronics-newsletter',
      type: 'newsletter-signup',
      settings: {
        heading: 'Get Dev Telemetry Updates',
        subheading: 'Receive low-level firmware changelogs, benchmark whitepapers, and notification of limited batch production runs.',
        placeholder: 'Enter developer email',
        buttonText: 'Subscribe to Feed',
        disclaimerText: 'Strictly zero spam. Raw telemetry and release notes only.',
        successMessage: 'Subscribed to telemetry feed. API credentials dispatched to your terminal.',
      },
    },
  ],
  navigation: [
    { label: 'Keyboards', href: '/electronics/collections/keyboards' },
    { label: 'Audio', href: '/electronics/collections/audio' },
    { label: 'Displays', href: '/electronics/collections/displays' },
    { label: 'Components', href: '/electronics/collections/components' },
  ],
};

export default electronicsThemeConfig;
