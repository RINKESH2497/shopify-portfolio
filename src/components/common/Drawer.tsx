import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export type DrawerPlacement = 'right' | 'left' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const PLACEMENT_CLASSES: Record<
  DrawerPlacement,
  { container: string; panel: string; closed: string; open: string }
> = {
  right: {
    container: 'justify-end',
    panel: 'h-full w-full max-w-md border-l',
    closed: 'translate-x-full',
    open: 'translate-x-0',
  },
  left: {
    container: 'justify-start',
    panel: 'h-full w-full max-w-md border-r',
    closed: '-translate-x-full',
    open: 'translate-x-0',
  },
  bottom: {
    container: 'items-end',
    panel: 'w-full max-h-[85vh] rounded-t-2xl border-t',
    closed: 'translate-y-full',
    open: 'translate-y-0',
  },
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  title,
  children,
  footer,
  className,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === panelRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const placementConfig = PLACEMENT_CLASSES[placement];

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex transition-opacity duration-300',
        placementConfig.container,
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Panel'}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex flex-col bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#18181b)] border-[var(--color-border,#e4e4e7)] shadow-2xl transition-transform duration-300 ease-in-out outline-none',
          placementConfig.panel,
          isOpen ? placementConfig.open : placementConfig.closed,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border,#e4e4e7)]">
          {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : <div />}
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-6 border-t border-[var(--color-border,#e4e4e7)] bg-[var(--color-surface,#ffffff)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
