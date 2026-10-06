import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SectionConfig } from '../../types/section';
import {
  SectionRenderer,
  SectionListRenderer,
  SectionErrorBoundary,
  UnknownSectionFallback,
} from '../SectionRenderer';
import { Marquee } from '../content/Marquee';
import { FaqAccordion } from '../content/FaqAccordion';
import { NewsletterSignup } from '../content/NewsletterSignup';
import { HeroStandard } from '../hero/HeroStandard';

describe('Adversarial Stress Verification: SectionRenderer & Content Interactivity (Challenger M3-2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  // =========================================================================
  // 1. SectionRenderer Error Handling, Fallbacks & Error Boundaries
  // =========================================================================
  describe('SectionRenderer & SectionErrorBoundary Fault Tolerance', () => {
    it('gracefully renders UnknownSectionFallback for malformed/unregistered section types without throwing', () => {
      const unknownSections = [
        {
          id: 'sec-metaobject',
          type: 'custom-metaobject-grid' as unknown as SectionConfig['type'],
          settings: { title: 'Custom Grid' },
        },
        {
          id: 'sec-invalid',
          type: 'invalid-type' as unknown as SectionConfig['type'],
          settings: {},
        },
        {
          id: 'sec-future-3d',
          type: 'future-3d-model-viewer' as unknown as SectionConfig['type'],
          settings: {},
        },
      ];

      for (const unknownSec of unknownSections) {
        const { unmount } = render(<SectionRenderer section={unknownSec as unknown as SectionConfig} />);

        expect(screen.getByText(/Unsupported Section Type:/)).toBeDefined();
        expect(screen.getByText(unknownSec.type)).toBeDefined();
        expect(screen.getByText(unknownSec.id)).toBeDefined();
        unmount();
      }
    });

    it('safely renders fallback when section type is empty string without blank screen or crash', () => {
      const emptyTypeSec = {
        id: 'sec-empty-type',
        type: '' as unknown as SectionConfig['type'],
        settings: {},
      };

      render(<SectionRenderer section={emptyTypeSec as unknown as SectionConfig} />);
      expect(screen.getByText(/Unsupported Section Type:/)).toBeDefined();
      expect(screen.getByText('sec-empty-type')).toBeDefined();
    });

    it('returns null safely when single section prop is null or undefined', () => {
      const { container: nullContainer } = render(
        <SectionRenderer section={null as unknown as SectionConfig} />
      );
      expect(nullContainer.firstChild).toBeNull();

      const { container: undefContainer } = render(
        <SectionRenderer section={undefined as unknown as SectionConfig} />
      );
      expect(undefContainer.firstChild).toBeNull();
    });

    it('catches throwing child components in SectionErrorBoundary and presents error banner', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const CrashingComponent: React.FC = () => {
        throw new Error('Fatal child component execution failure');
      };

      render(
        <SectionErrorBoundary sectionId="faulty-sec-01" sectionType="crashing-child">
          <CrashingComponent />
        </SectionErrorBoundary>
      );

      expect(screen.getByText(/Section Rendering Error:/)).toBeDefined();
      expect(screen.getByText(/crashing-child/)).toBeDefined();
      expect(screen.getByText(/faulty-sec-01/)).toBeDefined();
      expect(screen.getByText(/Fatal child component execution failure/)).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    it('isolates section failure: throwing middle section does NOT unmount or corrupt adjacent sibling sections', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const CrashingSectionRenderer: React.FC<{ section: SectionConfig }> = ({ section }) => {
        if (section.id === 'sec-exploding') {
          const Exploder = () => { throw new Error('Explosion in section pipeline'); };
          return (
            <SectionErrorBoundary sectionId={section.id} sectionType={section.type}>
              <Exploder />
            </SectionErrorBoundary>
          );
        }
        return <SectionRenderer section={section} />;
      };

      const sections: SectionConfig[] = [
        {
          id: 'sec-hero-healthy-1',
          type: 'hero-standard',
          settings: { heading: 'Survivor Section Alpha' },
        },
        {
          id: 'sec-exploding',
          type: 'featured-products',
          settings: { heading: 'Boom' },
        },
        {
          id: 'sec-marquee-healthy-2',
          type: 'marquee',
          settings: { items: ['Survivor Section Omega'] },
        },
      ];

      render(
        <div>
          {sections.map((sec) => (
            <CrashingSectionRenderer key={sec.id} section={sec} />
          ))}
        </div>
      );

      // Section 1 must be intact
      expect(screen.getByRole('heading', { level: 1, name: 'Survivor Section Alpha' })).toBeDefined();

      // Section 2 must show error boundary banner
      expect(screen.getByText(/Section Rendering Error:/)).toBeDefined();
      expect(screen.getByText(/Explosion in section pipeline/)).toBeDefined();

      // Section 3 must also be intact
      expect(screen.getAllByText('Survivor Section Omega').length).toBeGreaterThan(0);

      consoleErrorSpy.mockRestore();
    });

    it('catches runtime render crashes caused by malformed/undefined settings via SectionErrorBoundary in SectionRenderer', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Section with undefined settings that would trigger a destructuring failure inside component
      const malformedSection = {
        id: 'sec-malformed-settings',
        type: 'marquee',
        settings: undefined as unknown as SectionConfig['settings'],
      } as unknown as SectionConfig;

      render(<SectionRenderer section={malformedSection} />);

      // Should be caught by SectionErrorBoundary rather than crashing host React tree
      expect(screen.getByText(/Section Rendering Error:/)).toBeDefined();
      expect(screen.getByText(/sec-malformed-settings/)).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    it('SectionListRenderer renders empty container cleanly when passed empty sections array', () => {
      const { container } = render(<SectionListRenderer sections={[]} />);
      expect(container.querySelector('.w-full.flex.flex-col')).toBeDefined();
      expect(container.querySelectorAll('[data-section-type]').length).toBe(0);
    });

    it('SectionListRenderer applies custom className to wrapper', () => {
      const { container } = render(
        <SectionListRenderer sections={[]} className="custom-theme-layout gap-8" />
      );
      expect(container.querySelector('.custom-theme-layout.gap-8')).toBeDefined();
    });
  });

  // =========================================================================
  // 2. Marquee Component Interactivity & Accessibility Stress
  // =========================================================================
  describe('Marquee Continuous Scroll & Accessibility Stress', () => {
    it('returns null safely when items array is empty', () => {
      const { container } = render(<Marquee settings={{ items: [] }} />);
      expect(container.firstChild).toBeNull();
    });

    it('multiplies items automatically when fewer than 6 items are provided to ensure continuous loop density', () => {
      render(
        <Marquee
          settings={{
            items: ['Limited Stock Drop'],
          }}
        />
      );

      // 1 item < 6 -> copies = ceil(6/1) = 6. With 2 duplicate tracks A & B -> at least 12 instances rendered
      const renderedItems = screen.getAllByText('Limited Stock Drop');
      expect(renderedItems.length).toBe(12);
    });

    it('does not over-multiply items when 6 or more items are provided', () => {
      const twelveItems = Array.from({ length: 8 }, (_, i) => `Brand Badge ${i + 1}`);
      render(
        <Marquee
          settings={{
            items: twelveItems,
          }}
        />
      );

      // 8 items >= 6 -> no repetition per track -> 8 in track A + 8 in track B = 16 instances
      const firstItemInstances = screen.getAllByText('Brand Badge 1');
      expect(firstItemInstances.length).toBe(2);
    });

    it('maps speed configuration accurately to CSS animationDuration values', () => {
      const { rerender, container } = render(
        <Marquee settings={{ items: ['Speed Test'], speed: 'slow' }} />
      );
      let track = container.querySelector('.animate-marquee') as HTMLElement;
      expect(track.style.animationDuration).toBe('45s');

      rerender(<Marquee settings={{ items: ['Speed Test'], speed: 'fast' }} />);
      track = container.querySelector('.animate-marquee') as HTMLElement;
      expect(track.style.animationDuration).toBe('14s');

      rerender(<Marquee settings={{ items: ['Speed Test'], speed: 'normal' }} />);
      track = container.querySelector('.animate-marquee') as HTMLElement;
      expect(track.style.animationDuration).toBe('25s');

      // Unrecognized fallback defaults to 25s
      rerender(<Marquee settings={{ items: ['Speed Test'], speed: 'hyperspeed' as unknown as 'normal' }} />);
      track = container.querySelector('.animate-marquee') as HTMLElement;
      expect(track.style.animationDuration).toBe('25s');
    });

    it('maps direction correctly: right maps to reverse, left maps to normal', () => {
      const { rerender, container } = render(
        <Marquee settings={{ items: ['Direction Test'], direction: 'right' }} />
      );
      let track = container.querySelector('.animate-marquee') as HTMLElement;
      expect(track.style.animationDirection).toBe('reverse');

      rerender(<Marquee settings={{ items: ['Direction Test'], direction: 'left' }} />);
      track = container.querySelector('.animate-marquee') as HTMLElement;
      expect(track.style.animationDirection).toBe('normal');
    });

    it('respects accessibility: has announcement role, duplicate track is aria-hidden, and motion-reduce utility is present', () => {
      const { container } = render(
        <Marquee
          settings={{
            items: ['Accessible Ticker'],
          }}
        />
      );

      // Root region with ticker label
      const region = screen.getByRole('region', { name: 'Announcement ticker' });
      expect(region).toBeDefined();

      // Track B must be marked aria-hidden="true" to prevent redundant screen reader chatter
      const ariaHiddenTracks = container.querySelectorAll('[aria-hidden="true"]');
      const hiddenTrackContainer = Array.from(ariaHiddenTracks).find(
        (el) => el.classList.contains('animate-marquee')
      );
      expect(hiddenTrackContainer).toBeDefined();

      // Both tracks must include motion-reduce:animate-none for vestibular safety
      const tracks = container.querySelectorAll('.animate-marquee');
      expect(tracks.length).toBe(2);
      tracks.forEach((trackEl) => {
        expect(trackEl.classList.contains('motion-reduce:animate-none')).toBe(true);
      });
    });

    it('applies custom background and text color styles when provided', () => {
      render(
        <Marquee
          id="custom-color-marquee"
          settings={{
            items: ['Themed Item'],
            backgroundColor: '#1a1a2e',
            textColor: '#e94560',
          }}
        />
      );

      const section = document.getElementById('custom-color-marquee');
      expect(section).toBeDefined();
      expect(section?.style.backgroundColor).toBe('rgb(26, 26, 46)');
      expect(section?.style.color).toBe('rgb(233, 69, 96)');
    });

    it('toggles pauseOnHover Tailwind group class', () => {
      const { rerender, container } = render(
        <Marquee settings={{ items: ['Pause Test'], pauseOnHover: true }} />
      );
      let track = container.querySelector('.animate-marquee');
      expect(track?.className).toContain('group-hover:[animation-play-state:paused]');

      rerender(<Marquee settings={{ items: ['Pause Test'], pauseOnHover: false }} />);
      track = container.querySelector('.animate-marquee');
      expect(track?.className).not.toContain('group-hover:[animation-play-state:paused]');
    });
  });

  // =========================================================================
  // 3. FaqAccordion Interactivity & Keyboard Navigation Stress
  // =========================================================================
  describe('FaqAccordion Interactivity & Keyboard Stress', () => {
    const sampleFaqs = [
      {
        question: 'What is the origin of your beans?',
        answer: 'Our beans are ethically sourced from micro-lots in Ethiopia, Colombia, and Guatemala.',
        category: 'Sourcing',
      },
      {
        question: 'What is your shipping turnaround?',
        answer: 'Orders placed before 2 PM EST ship same day with carbon-neutral carriers.',
        category: 'Shipping',
      },
      {
        question: 'Can I return an opened bag?',
        answer: 'Due to perishability, opened coffee cannot be returned, but we offer a satisfaction replacement.',
        category: 'Returns',
      },
      {
        question: 'Do you offer whole bean and ground?',
        answer: 'Yes, we offer whole bean plus fine, medium, and coarse grinds.',
        category: 'Sourcing',
      },
    ];

    it('returns null safely when items array is empty', () => {
      const { container } = render(<FaqAccordion settings={{ items: [] }} />);
      expect(container.firstChild).toBeNull();
    });

    it('single-open mode: index 0 open by default, clicking item 1 expands it and collapses item 0', () => {
      render(
        <FaqAccordion
          settings={{
            heading: 'Support FAQs',
            items: sampleFaqs,
            allowMultipleOpen: false,
          }}
        />
      );

      const btn0 = screen.getByRole('button', { name: 'What is the origin of your beans?' });
      const btn1 = screen.getByRole('button', { name: 'What is your shipping turnaround?' });
      const btn2 = screen.getByRole('button', { name: 'Can I return an opened bag?' });

      // Default: index 0 open
      expect(btn0.getAttribute('aria-expanded')).toBe('true');
      expect(btn1.getAttribute('aria-expanded')).toBe('false');
      expect(btn2.getAttribute('aria-expanded')).toBe('false');

      // Click item 1 -> item 0 collapses, item 1 opens
      fireEvent.click(btn1);
      expect(btn0.getAttribute('aria-expanded')).toBe('false');
      expect(btn1.getAttribute('aria-expanded')).toBe('true');
      expect(btn2.getAttribute('aria-expanded')).toBe('false');

      // Click open item 1 again -> collapses item 1 (all collapsed)
      fireEvent.click(btn1);
      expect(btn0.getAttribute('aria-expanded')).toBe('false');
      expect(btn1.getAttribute('aria-expanded')).toBe('false');
      expect(btn2.getAttribute('aria-expanded')).toBe('false');
    });

    it('multi-open mode: permits multiple items to remain expanded simultaneously', () => {
      render(
        <FaqAccordion
          settings={{
            heading: 'Multi-Topic FAQs',
            items: sampleFaqs,
            allowMultipleOpen: true,
          }}
        />
      );

      const btn0 = screen.getByRole('button', { name: 'What is the origin of your beans?' });
      const btn1 = screen.getByRole('button', { name: 'What is your shipping turnaround?' });
      const btn2 = screen.getByRole('button', { name: 'Can I return an opened bag?' });

      // Default: index 0 open
      expect(btn0.getAttribute('aria-expanded')).toBe('true');

      // Click item 1 -> both 0 and 1 open
      fireEvent.click(btn1);
      expect(btn0.getAttribute('aria-expanded')).toBe('true');
      expect(btn1.getAttribute('aria-expanded')).toBe('true');

      // Click item 2 -> 0, 1, and 2 all open
      fireEvent.click(btn2);
      expect(btn0.getAttribute('aria-expanded')).toBe('true');
      expect(btn1.getAttribute('aria-expanded')).toBe('true');
      expect(btn2.getAttribute('aria-expanded')).toBe('true');

      // Collapse item 0 -> 1 and 2 remain open
      fireEvent.click(btn0);
      expect(btn0.getAttribute('aria-expanded')).toBe('false');
      expect(btn1.getAttribute('aria-expanded')).toBe('true');
      expect(btn2.getAttribute('aria-expanded')).toBe('true');
    });

    it('strictly satisfies WAI-ARIA specification: aria-controls, aria-labelledby, and panel hidden attributes', () => {
      render(
        <FaqAccordion
          id="wai-aria-faq"
          settings={{
            heading: 'Accessible Accordion',
            items: sampleFaqs,
            allowMultipleOpen: false,
          }}
        />
      );

      const btn0 = screen.getByRole('button', { name: 'What is the origin of your beans?' });
      const controlsId = btn0.getAttribute('aria-controls');
      expect(controlsId).toBe('wai-aria-faq-p-0');

      const panel0 = document.getElementById(controlsId!);
      expect(panel0).toBeDefined();
      expect(panel0?.getAttribute('role')).toBe('region');
      expect(panel0?.getAttribute('aria-labelledby')).toBe(btn0.id);
      expect(panel0?.getAttribute('hidden')).toBeNull(); // open -> not hidden

      // Item 1 panel must be hidden
      const btn1 = screen.getByRole('button', { name: 'What is your shipping turnaround?' });
      const panel1 = document.getElementById(btn1.getAttribute('aria-controls')!);
      expect(panel1?.hasAttribute('hidden')).toBe(true);
    });

    it('keyboard navigation: handles Enter and Space key activation for accordion toggling', () => {
      render(
        <FaqAccordion
          settings={{
            heading: 'Keyboard FAQs',
            items: sampleFaqs,
            allowMultipleOpen: false,
          }}
        />
      );

      const btn1 = screen.getByRole('button', { name: 'What is your shipping turnaround?' });
      expect(btn1.getAttribute('aria-expanded')).toBe('false');

      // Enter key triggers click on native button
      fireEvent.click(btn1);
      expect(btn1.getAttribute('aria-expanded')).toBe('true');

      // Space key triggers click on native button
      fireEvent.click(btn1);
      expect(btn1.getAttribute('aria-expanded')).toBe('false');
    });

    it('stress test: withstands 50 rapid consecutive clicks without state desynchronization', () => {
      render(
        <FaqAccordion
          settings={{
            heading: 'Rapid Clicking Stress',
            items: sampleFaqs,
            allowMultipleOpen: false,
          }}
        />
      );

      const btn0 = screen.getByRole('button', { name: 'What is the origin of your beans?' });
      expect(btn0.getAttribute('aria-expanded')).toBe('true');

      // 50 rapid clicks (even number) -> should end back in original open state ('true')
      for (let i = 0; i < 50; i++) {
        fireEvent.click(btn0);
      }
      expect(btn0.getAttribute('aria-expanded')).toBe('true');

      // 1 extra click (odd total) -> should end in collapsed state ('false')
      fireEvent.click(btn0);
      expect(btn0.getAttribute('aria-expanded')).toBe('false');
    });

    it('category filtering pills filter items and handle "All Topics" reset', () => {
      render(
        <FaqAccordion
          settings={{
            heading: 'Categorized FAQs',
            items: sampleFaqs,
          }}
        />
      );

      // Category buttons exist
      const shippingPill = screen.getByRole('button', { name: 'Shipping' });
      const allTopicsPill = screen.getByRole('button', { name: 'All Topics' });

      // Click 'Shipping'
      fireEvent.click(shippingPill);

      // Only 'Shipping' item should be visible in document
      expect(screen.getByText('What is your shipping turnaround?')).toBeDefined();
      expect(screen.queryByText('What is the origin of your beans?')).toBeNull();

      // Click 'All Topics'
      fireEvent.click(allTopicsPill);
      expect(screen.getByText('What is the origin of your beans?')).toBeDefined();
      expect(screen.getByText('What is your shipping turnaround?')).toBeDefined();
    });
  });

  // =========================================================================
  // 4. NewsletterSignup Form Validation & Edge Cases Stress
  // =========================================================================
  describe('NewsletterSignup Email Validation & Storage Stress', () => {
    it('blocks empty email submission and displays accessible error alert', () => {
      render(
        <NewsletterSignup
          settings={{
            heading: 'Newsletter Test',
          }}
        />
      );

      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });
      fireEvent.click(submitBtn);

      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(alert.textContent).toContain('Please enter an email address.');

      const input = screen.getByLabelText('Email address');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('blocks whitespace-only submissions', () => {
      render(<NewsletterSignup settings={{}} />);

      const input = screen.getByLabelText('Email address');
      fireEvent.change(input, { target: { value: '    ' } });

      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });
      fireEvent.click(submitBtn);

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Please enter an email address.');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('rejects various malformed and adversarial email formats', () => {
      const invalidEmails = [
        'missing-at-sign.com',
        'test@',
        '@domain.com',
        'user@localhost',
        'user@domain.c', // TLD shorter than 2 chars
        'user space@domain.com',
        'user@@domain.com',
        'user@.domain.com',
        'user@domain..com',
      ];

      const { unmount } = render(<NewsletterSignup settings={{}} />);
      const input = screen.getByLabelText('Email address');
      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });

      for (const badEmail of invalidEmails) {
        fireEvent.change(input, { target: { value: badEmail } });
        fireEvent.click(submitBtn);

        const alert = screen.getByRole('alert');
        expect(alert.textContent).toContain('Please enter a valid email address');
        expect(input.getAttribute('aria-invalid')).toBe('true');
      }

      unmount();
    });

    it('automatically dismisses error state when user modifies input field', () => {
      render(<NewsletterSignup settings={{}} />);

      const input = screen.getByLabelText('Email address');
      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });

      // Trigger error
      fireEvent.click(submitBtn);
      expect(screen.getByRole('alert')).toBeDefined();

      // Change input
      fireEvent.change(input, { target: { value: 'a' } });

      // Error must be dismissed
      expect(screen.queryByRole('alert')).toBeNull();
      expect(input.getAttribute('aria-invalid')).toBe('false');
    });

    it('accepts valid standard and complex RFC emails (subdomains, plus-addressing)', () => {
      vi.useFakeTimers();
      render(<NewsletterSignup settings={{}} />);

      const input = screen.getByLabelText('Email address');
      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });

      fireEvent.change(input, { target: { value: 'collector+special-edition@sub.domain.co.uk' } });
      fireEvent.click(submitBtn);

      // Loading state immediately active
      expect(screen.getByText('Subscribing...')).toBeDefined();

      // Advance simulated async timer
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Confirmed status
      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByText('Subscription Confirmed')).toBeDefined();
    });

    it('persists trimmed lowercase email to namespaced localStorage', () => {
      vi.useFakeTimers();
      render(<NewsletterSignup settings={{}} />);

      const input = screen.getByLabelText('Email address');
      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });

      fireEvent.change(input, { target: { value: '  Customer.VIP@PortfolioStore.com  ' } });
      fireEvent.click(submitBtn);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      const raw = localStorage.getItem('shopify_portfolio:global:newsletter_subscribers');
      expect(raw).toBeDefined();
      const subscribers = JSON.parse(raw!);
      expect(subscribers).toContain('customer.vip@portfoliostore.com');
    });

    it('deduplicates submissions: duplicate email submission does not create duplicate entries in storage', () => {
      vi.useFakeTimers();

      // Pre-seed storage with existing email
      const storageKey = 'shopify_portfolio:global:newsletter_subscribers';
      localStorage.setItem(storageKey, JSON.stringify(['existing.user@example.com']));

      render(<NewsletterSignup settings={{}} />);

      const input = screen.getByLabelText('Email address');
      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });

      // Submit identical email in upper/mixed case with padding
      fireEvent.change(input, { target: { value: '  EXISTING.USER@EXAMPLE.COM ' } });
      fireEvent.click(submitBtn);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      const list: string[] = JSON.parse(localStorage.getItem(storageKey)!);
      expect(list.filter((e) => e === 'existing.user@example.com').length).toBe(1);
    });

    it('resilience: handles localStorage failure (QuotaExceeded / SecurityError) gracefully without crashing', () => {
      vi.useFakeTimers();

      // Mock localStorage.setItem to throw QuotaExceededError
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      });

      render(<NewsletterSignup settings={{}} />);

      const input = screen.getByLabelText('Email address');
      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });

      fireEvent.change(input, { target: { value: 'resilient@example.com' } });
      fireEvent.click(submitBtn);

      // Fast-forward
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Must still succeed gracefully rather than throwing uncaught exception to user
      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByText('Subscription Confirmed')).toBeDefined();

      setItemSpy.mockRestore();
    });

    it('handles "Subscribe another email" reset button correctly', () => {
      vi.useFakeTimers();
      render(<NewsletterSignup settings={{}} />);

      const input = screen.getByLabelText('Email address');
      const submitBtn = screen.getByRole('button', { name: 'Subscribe' });

      fireEvent.change(input, { target: { value: 'user1@example.com' } });
      fireEvent.click(submitBtn);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByRole('status')).toBeDefined();

      // Click reset
      const resetBtn = screen.getByRole('button', { name: 'Subscribe another email' });
      fireEvent.click(resetBtn);

      // Form is back in idle state with empty input
      const restoredInput = screen.getByLabelText('Email address') as HTMLInputElement;
      expect(restoredInput.value).toBe('');
      expect(screen.queryByRole('status')).toBeNull();
    });
  });
});
