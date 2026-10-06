import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SectionConfig } from '../types/section';
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
