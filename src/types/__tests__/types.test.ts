import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import type {
  SectionConfig,
  OrderStatus,
  PaymentStatus,
  CheckoutStep,
} from '../index';

describe('TypeScript Contract & Discriminated Union Verification', () => {
  it('all 14 section types are present and narrow exhaustively without any loose types', () => {
    function assertNever(val: never): never {
      throw new Error(`Unhandled section: ${JSON.stringify(val)}`);
    }

    const testConfigs: SectionConfig[] = [
      { id: '1', type: 'hero-standard', settings: { heading: 'Standard' } },
      { id: '2', type: 'hero-split', settings: { heading: 'Split', imageUrl: 'i.jpg', imageAlt: 'a' } },
      { id: '3', type: 'hero-fullscreen', settings: { heading: 'Full', mediaUrl: 'v.mp4' } },
      { id: '4', type: 'featured-products', settings: { heading: 'Featured' } },
      { id: '5', type: 'product-carousel', settings: { heading: 'Carousel' } },
      { id: '6', type: 'collection-cards', settings: { collections: [] } },
      { id: '7', type: 'image-with-text', settings: { heading: 'Story', content: 'C', imageUrl: 'i.jpg', imageAlt: 'a' } },
      { id: '8', type: 'testimonials', settings: { testimonials: [] } },
      { id: '9', type: 'reviews-breakdown', settings: { averageRating: 4.8, totalReviews: 50 } },
      { id: '10', type: 'logo-cloud', settings: { logos: [] } },
      { id: '11', type: 'marquee', settings: { items: ['Test'] } },
      { id: '12', type: 'newsletter-signup', settings: { heading: 'Join' } },
      { id: '13', type: 'faq-accordion', settings: { heading: 'FAQ', items: [] } },
      { id: '14', type: 'editorial-grid', settings: { items: [] } },
    ];

    expect(testConfigs.length).toBe(14);

    const verifiedTypes: string[] = [];

    for (const sec of testConfigs) {
      switch (sec.type) {
        case 'hero-standard':
          verifiedTypes.push(sec.type);
          expect(typeof sec.settings.heading).toBe('string');
          break;
        case 'hero-split':
          verifiedTypes.push(sec.type);
          expect(typeof sec.settings.imageUrl).toBe('string');
          break;
        case 'hero-fullscreen':
          verifiedTypes.push(sec.type);
          expect(typeof sec.settings.mediaUrl).toBe('string');
          break;
        case 'featured-products':
          verifiedTypes.push(sec.type);
          break;
        case 'product-carousel':
          verifiedTypes.push(sec.type);
          break;
        case 'collection-cards':
          verifiedTypes.push(sec.type);
          expect(Array.isArray(sec.settings.collections)).toBe(true);
          break;
        case 'image-with-text':
          verifiedTypes.push(sec.type);
          expect(typeof sec.settings.content).toBe('string');
          break;
        case 'testimonials':
          verifiedTypes.push(sec.type);
          expect(Array.isArray(sec.settings.testimonials)).toBe(true);
          break;
        case 'reviews-breakdown':
          verifiedTypes.push(sec.type);
          expect(typeof sec.settings.averageRating).toBe('number');
          break;
        case 'logo-cloud':
          verifiedTypes.push(sec.type);
          expect(Array.isArray(sec.settings.logos)).toBe(true);
          break;
        case 'marquee':
          verifiedTypes.push(sec.type);
          expect(Array.isArray(sec.settings.items)).toBe(true);
          break;
        case 'newsletter-signup':
          verifiedTypes.push(sec.type);
          expect(typeof sec.settings.heading).toBe('string');
          break;
        case 'faq-accordion':
          verifiedTypes.push(sec.type);
          expect(Array.isArray(sec.settings.items)).toBe(true);
          break;
        case 'editorial-grid':
          verifiedTypes.push(sec.type);
          expect(Array.isArray(sec.settings.items)).toBe(true);
          break;
        default:
          assertNever(sec);
      }
    }

    expect(verifiedTypes.length).toBe(14);
  });

  it('validates zero "any" types in all src/types/*.ts files', () => {
    const typesDir = path.resolve(__dirname, '../');
    const typeFiles = fs.readdirSync(typesDir).filter((f) => f.endsWith('.ts'));

    const anyViolations: { file: string; line: number; text: string }[] = [];

    for (const file of typeFiles) {
      const fullPath = path.join(typesDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        // Skip comment lines
        if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
          return;
        }

        // Check for `any` type annotations
        const anyRegex = /(:\s*any\b|<.*?\bany\b.*?>|\bany\[\]|\|\s*any\b|\bany\s*\|)/;
        if (anyRegex.test(trimmed)) {
          anyViolations.push({
            file,
            line: index + 1,
            text: trimmed,
          });
        }
      });
    }

    expect(anyViolations).toEqual([]);
  });

  it('validates exhaustive narrowing for CheckoutStep, OrderStatus, and PaymentStatus', () => {
    function processCheckoutStep(step: CheckoutStep): number {
      switch (step) {
        case 'information': return 1;
        case 'shipping': return 2;
        case 'payment': return 3;
        case 'confirmation': return 4;
        default: {
          const _ex: never = step;
          return _ex;
        }
      }
    }

    function processOrderStatus(status: OrderStatus): boolean {
      switch (status) {
        case 'pending':
        case 'processing':
        case 'shipped':
        case 'delivered':
        case 'cancelled':
          return true;
        default: {
          const _ex: never = status;
          return _ex;
        }
      }
    }

    function processPaymentStatus(status: PaymentStatus): boolean {
      switch (status) {
        case 'paid':
        case 'pending':
        case 'refunded':
          return true;
        default: {
          const _ex: never = status;
          return _ex;
        }
      }
    }

    expect(processCheckoutStep('information')).toBe(1);
    expect(processCheckoutStep('confirmation')).toBe(4);
    expect(processOrderStatus('delivered')).toBe(true);
    expect(processPaymentStatus('paid')).toBe(true);
  });
});
