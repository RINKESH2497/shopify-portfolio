import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Modal } from '../Modal';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Modal Component - Adversarial Stress & Contract Verification', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'modal-test-container';
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
      (el) => el.id !== 'modal-test-container' && el.tagName !== 'SCRIPT'
    );
    portals.forEach((p) => p.remove());
    document.body.style.overflow = '';
  });

  describe('1. Unmounting & DOM Presence', () => {
    it('returns null and leaves 0 DOM elements in document.body when isOpen is false', () => {
      act(() => {
        root.render(
          <Modal isOpen={false} onClose={() => {}} title="Closed Modal">
            <p>Hidden Modal Body</p>
          </Modal>
        );
      });

      const dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(0);

      const nonContainerElements = Array.from(document.body.children).filter(
        (el) => el.id !== 'modal-test-container' && el.tagName !== 'SCRIPT'
      );
      expect(nonContainerElements.length).toBe(0);
    });

    it('mounts dialog portal into body when isOpen is true, and completely removes it when toggled to false', () => {
      let setOpenFn: (val: boolean) => void = () => {};

      const TestWrapper = () => {
        const [open, setOpen] = useState(true);
        setOpenFn = setOpen;
        return (
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Toggle Modal">
            <input id="modal-test-input" type="text" />
          </Modal>
        );
      };

      act(() => {
        root.render(<TestWrapper />);
      });

      // Initially open
      let dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(1);
      expect(dialogs[0].textContent).toContain('Toggle Modal');

      // Close modal
      act(() => {
        setOpenFn(false);
      });

      // Fully removed from DOM
      dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(0);

      const nonContainerElements = Array.from(document.body.children).filter(
        (el) => el.id !== 'modal-test-container' && el.tagName !== 'SCRIPT'
      );
      expect(nonContainerElements.length).toBe(0);
    });

    it('cleans up portal DOM elements from body when unmounted while open', () => {
      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} title="Unmount Test Modal">
            <p>Active content</p>
          </Modal>
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
          <Modal isOpen={true} onClose={() => {}}>
            <p>Scroll Lock Modal</p>
          </Modal>
        );
      });

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        root.render(
          <Modal isOpen={false} onClose={() => {}}>
            <p>Scroll Lock Modal</p>
          </Modal>
        );
      });

      expect(document.body.style.overflow).toBe('');
    });

    it('restores pre-existing custom body overflow upon unmount while open', () => {
      document.body.style.overflow = 'scroll';

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}}>
            <p>Pre-existing Scroll Test</p>
          </Modal>
        );
      });

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        root.unmount();
      });

      expect(document.body.style.overflow).toBe('scroll');
    });

    it('restores pre-existing overflow "auto" when closed via isOpen toggle', () => {
      document.body.style.overflow = 'auto';

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}}>
            <p>Pre-existing Auto Test</p>
          </Modal>
        );
      });

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        root.render(
          <Modal isOpen={false} onClose={() => {}}>
            <p>Pre-existing Auto Test</p>
          </Modal>
        );
      });

      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('3. Keyboard Focus Trapping Logic', () => {
    it('sets initial focus to modal surface container and stores previous focus', () => {
      const triggerBtn = document.createElement('button');
      triggerBtn.id = 'modal-trigger-btn';
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} title="Focus Modal">
            <button id="inside-btn">Confirm</button>
          </Modal>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const surface = dialog.querySelector('[tabindex="-1"]');
      expect(document.activeElement).toBe(surface);

      triggerBtn.remove();
    });

    it('triggers onClose when Escape key is pressed', () => {
      const handleClose = vi.fn();

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={handleClose} title="Escape Modal">
            <p>Press ESC</p>
          </Modal>
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
          <Modal isOpen={true} onClose={() => {}} title="Tab Cycle Modal">
            <input id="modal-input" type="text" />
            <button id="modal-submit-btn">Submit</button>
          </Modal>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const surface = dialog.querySelector('[tabindex="-1"]') as HTMLElement;
      const focusable = surface.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      expect(focusable.length).toBeGreaterThanOrEqual(3);
      const firstEl = focusable[0]; // Close button
      const lastEl = focusable[focusable.length - 1]; // Submit button

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
          <Modal isOpen={true} onClose={() => {}} title="Shift Tab Modal">
            <input id="modal-shift-input" type="text" />
            <button id="modal-shift-btn">Action</button>
          </Modal>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const surface = dialog.querySelector('[tabindex="-1"]') as HTMLElement;
      const focusable = surface.querySelectorAll<HTMLElement>(
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

    it('traps Shift+Tab when surface container itself is focused, wrapping to last element', () => {
      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} title="Surface Shift Tab">
            <button id="surface-action-btn">Action</button>
          </Modal>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      const surface = dialog.querySelector('[tabindex="-1"]') as HTMLElement;
      const focusable = surface.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const lastEl = focusable[focusable.length - 1];

      surface.focus();
      expect(document.activeElement).toBe(surface);

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

    it('handles empty focusable elements without throwing error', () => {
      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}}>
            <div>No interactive controls</div>
          </Modal>
        );
      });

      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: false,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(tabEvent);

      expect(tabEvent.defaultPrevented).toBe(true);
    });

    it('restores focus to previously active element on close', () => {
      const triggerBtn = document.createElement('button');
      triggerBtn.id = 'modal-open-btn';
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} title="Restore Focus">
            <p>Modal Body</p>
          </Modal>
        );
      });

      expect(document.activeElement).not.toBe(triggerBtn);

      act(() => {
        root.render(
          <Modal isOpen={false} onClose={() => {}} title="Restore Focus">
            <p>Modal Body</p>
          </Modal>
        );
      });

      expect(document.activeElement).toBe(triggerBtn);
      triggerBtn.remove();
    });
  });

  describe('4. Backdrop & Size Variants', () => {
    it('clicking backdrop calls onClose when closeOnBackdropClick is true (default)', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <Modal isOpen={true} onClose={handleClose} title="Backdrop Test">
            <p>Body</p>
          </Modal>
        );
      });

      const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(backdrop).toBeDefined();
      backdrop.click();

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('clicking backdrop does NOT call onClose when closeOnBackdropClick is false', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <Modal isOpen={true} onClose={handleClose} closeOnBackdropClick={false} title="No Dismiss Test">
            <p>Body</p>
          </Modal>
        );
      });

      const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      backdrop.click();

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('clicking header close button calls onClose', () => {
      const handleClose = vi.fn();
      act(() => {
        root.render(
          <Modal isOpen={true} onClose={handleClose} title="Close Button Test">
            <p>Body</p>
          </Modal>
        );
      });

      const closeBtn = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement;
      closeBtn.click();

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('applies correct sizing classes (sm, md, lg, xl, full)', () => {
      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} size="sm">
            <p>Small</p>
          </Modal>
        );
      });
      expect(document.querySelector('[tabindex="-1"]')?.className).toContain('max-w-md');

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} size="lg">
            <p>Large</p>
          </Modal>
        );
      });
      expect(document.querySelector('[tabindex="-1"]')?.className).toContain('max-w-2xl');

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} size="xl">
            <p>XL</p>
          </Modal>
        );
      });
      expect(document.querySelector('[tabindex="-1"]')?.className).toContain('max-w-4xl');

      act(() => {
        root.render(
          <Modal isOpen={true} onClose={() => {}} size="full">
            <p>Full</p>
          </Modal>
        );
      });
      expect(document.querySelector('[tabindex="-1"]')?.className).toContain('max-w-[95vw]');
    });
  });
});
