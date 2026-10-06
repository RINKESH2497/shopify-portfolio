import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Drawer } from '../Drawer';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Drawer Component - Adversarial Stress & Contract Verification', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    root = createRoot(container);
    document.body.style.overflow = '';
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    // Clean up any stray portals
    const portals = Array.from(document.body.children).filter(
      (el) => el.id !== 'test-container' && el.tagName !== 'SCRIPT'
    );
    portals.forEach((p) => p.remove());
    document.body.style.overflow = '';
  });

  describe('1. Unmounting & DOM Presence', () => {
    it('returns null and leaves 0 DOM elements in document.body when isOpen is false', () => {
      act(() => {
        root.render(
          <Drawer isOpen={false} onClose={() => {}} title="Closed Drawer">
            <p>Hidden Content</p>
          </Drawer>
        );
      });

      const dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(0);

      const nonContainerElements = Array.from(document.body.children).filter(
        (el) => el.id !== 'test-container' && el.tagName !== 'SCRIPT'
      );
      expect(nonContainerElements.length).toBe(0);
    });

    it('mounts dialog portal into body when isOpen is true, and completely removes it when toggled to false', () => {
      let setOpenFn: (val: boolean) => void = () => {};

      const TestWrapper = () => {
        const [open, setOpen] = useState(true);
        setOpenFn = setOpen;
        return (
          <Drawer isOpen={open} onClose={() => setOpen(false)} title="Toggle Drawer">
            <button id="inside-btn">Inside</button>
          </Drawer>
        );
      };

      act(() => {
        root.render(<TestWrapper />);
      });

      // Initially open
      let dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(1);
      expect(dialogs[0].getAttribute('aria-modal')).toBe('true');
      expect(dialogs[0].textContent).toContain('Toggle Drawer');

      // Toggle close
      act(() => {
        setOpenFn(false);
      });

      // Fully unmounted from DOM
      dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(0);

      const nonContainerElements = Array.from(document.body.children).filter(
        (el) => el.id !== 'test-container' && el.tagName !== 'SCRIPT'
      );
      expect(nonContainerElements.length).toBe(0);
    });

    it('cleans up portal DOM elements from body when unmounted while open', () => {
      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} title="Unmount Drawer">
            <p>Drawer Content</p>
          </Drawer>
        );
      });

      expect(document.querySelectorAll('[role="dialog"]').length).toBe(1);

      act(() => {
        root.unmount();
      });

      expect(document.querySelectorAll('[role="dialog"]').length).toBe(0);
    });
  });

  describe('2. Body Scroll Lock & Cleanup', () => {
    it('locks body scroll to hidden when opened and restores empty overflow on close', () => {
      document.body.style.overflow = '';

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}}>
            <p>Scroll Lock Test</p>
          </Drawer>
        );
      });

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        root.render(
          <Drawer isOpen={false} onClose={() => {}}>
            <p>Scroll Lock Test</p>
          </Drawer>
        );
      });

      expect(document.body.style.overflow).toBe('');
    });

    it('restores pre-existing custom body overflow upon unmount while open', () => {
      document.body.style.overflow = 'auto';

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}}>
            <p>Custom Overflow Test</p>
          </Drawer>
        );
      });

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        root.unmount();
      });

      expect(document.body.style.overflow).toBe('auto');
    });

    it('restores pre-existing overflow "scroll" when closed via isOpen toggle', () => {
      document.body.style.overflow = 'scroll';

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}}>
            <p>Pre-existing Scroll Test</p>
          </Drawer>
        );
      });

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        root.render(
          <Drawer isOpen={false} onClose={() => {}}>
            <p>Pre-existing Scroll Test</p>
          </Drawer>
        );
      });

      expect(document.body.style.overflow).toBe('scroll');
    });
  });

  describe('3. Keyboard Focus Trapping Logic', () => {
    it('sets initial focus to drawer panel container and stores previous focus', () => {
      const triggerBtn = document.createElement('button');
      triggerBtn.id = 'trigger-btn';
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} title="Focus Drawer">
            <button id="cart-item-remove">Remove</button>
          </Drawer>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const panel = dialog.querySelector('[tabindex="-1"]');
      expect(document.activeElement).toBe(panel);

      triggerBtn.remove();
    });

    it('triggers onClose when Escape key is pressed', () => {
      const handleClose = vi.fn();

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={handleClose} title="Escape Test Drawer">
            <p>Press ESC</p>
          </Drawer>
        );
      });

      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(escEvent);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('traps Tab focus: cycling forward from last focusable element to first element', () => {
      act(() => {
        root.render(
          <Drawer
            isOpen={true}
            onClose={() => {}}
            title="Tab Cycle Drawer"
            footer={<button id="checkout-btn">Checkout</button>}
          >
            <input id="promo-code" type="text" />
          </Drawer>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const panel = dialog.querySelector('[tabindex="-1"]') as HTMLElement;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      expect(focusable.length).toBeGreaterThanOrEqual(3);
      const firstEl = focusable[0]; // Header close button
      const lastEl = focusable[focusable.length - 1]; // Checkout button

      // Focus last element
      lastEl.focus();
      expect(document.activeElement).toBe(lastEl);

      // Press Tab
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: false,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(tabEvent);

      expect(tabEvent.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(firstEl);
    });

    it('traps Shift+Tab focus: cycling backward from first focusable element to last element', () => {
      act(() => {
        root.render(
          <Drawer
            isOpen={true}
            onClose={() => {}}
            title="Shift Tab Drawer"
            footer={<button id="checkout-btn-rev">Checkout</button>}
          >
            <input id="note-input" type="text" />
          </Drawer>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const panel = dialog.querySelector('[tabindex="-1"]') as HTMLElement;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      firstEl.focus();
      expect(document.activeElement).toBe(firstEl);

      // Press Shift+Tab
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(shiftTabEvent);

      expect(shiftTabEvent.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(lastEl);
    });

    it('traps Shift+Tab when panel container itself is focused, wrapping to last element', () => {
      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} title="Panel Shift Tab">
            <button id="action-btn">Action</button>
          </Drawer>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const panel = dialog.querySelector('[tabindex="-1"]') as HTMLElement;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const lastEl = focusable[focusable.length - 1];

      panel.focus();
      expect(document.activeElement).toBe(panel);

      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(shiftTabEvent);

      expect(shiftTabEvent.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(lastEl);
    });

    it('restores focus to previously active element on close', () => {
      const triggerBtn = document.createElement('button');
      triggerBtn.id = 'drawer-trigger';
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} title="Restore Test">
            <p>Body</p>
          </Drawer>
        );
      });

      expect(document.activeElement).not.toBe(triggerBtn);

      act(() => {
        root.render(
          <Drawer isOpen={false} onClose={() => {}} title="Restore Test">
            <p>Body</p>
          </Drawer>
        );
      });

      expect(document.activeElement).toBe(triggerBtn);
      triggerBtn.remove();
    });
  });

  describe('4. Backdrop & Placement Features', () => {
    it('clicking backdrop calls onClose', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={handleClose} title="Backdrop Drawer">
            <p>Body</p>
          </Drawer>
        );
      });

      const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(backdrop).toBeDefined();
      backdrop.click();

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('clicking close button calls onClose', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={handleClose} title="Close Button Drawer">
            <p>Body</p>
          </Drawer>
        );
      });

      const closeBtn = document.querySelector('[aria-label="Close drawer"]') as HTMLButtonElement;
      expect(closeBtn).toBeDefined();
      closeBtn.click();

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('applies placement classes for right, left, and bottom', () => {
      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} placement="right">
            <p>Right Drawer</p>
          </Drawer>
        );
      });
      expect(document.querySelector('[role="dialog"]')!.className).toContain('justify-end');

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} placement="left">
            <p>Left Drawer</p>
          </Drawer>
        );
      });
      expect(document.querySelector('[role="dialog"]')!.className).toContain('justify-start');

      act(() => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} placement="bottom">
            <p>Bottom Drawer</p>
          </Drawer>
        );
      });
      expect(document.querySelector('[role="dialog"]')!.className).toContain('items-end');
    });
  });
});
