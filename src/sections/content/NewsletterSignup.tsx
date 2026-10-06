import React, { useState, useId } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { NewsletterSignupSettings } from '../../types/section';
import { Button } from '../../components/common/Button';
import { useStore } from '../../engine/StoreContext';
import { cn } from '../../utils/cn';

export interface NewsletterSignupProps {
  settings: NewsletterSignupSettings;
  id?: string;
  className?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading = 'Join Our Newsletter',
    subheading = 'Subscribe for exclusive offers, new product launches, and seasonal curation.',
    placeholder = 'Enter your email address',
    buttonText = 'Subscribe',
    disclaimerText = 'By subscribing, you agree to receive email updates. Unsubscribe anytime.',
    successMessage = 'Thank you for subscribing! Your welcome discount code has been sent.',
  } = settings;

  const sectionId = id || useId();
  const inputId = `${sectionId}-email`;
  const errorId = `${sectionId}-error`;
  const disclaimerId = `${sectionId}-disclaimer`;

  // Safe fallback if StoreContext is not present
  let storeId = 'global';
  try {
    const store = useStore();
    if (store?.storeId) storeId = store.storeId;
  } catch {
    // Standalone fallback
  }

  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an email address.');
      return false;
    }
    const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!regex.test(trimmed)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Simulate async subscription dispatch
    setTimeout(() => {
      try {
        const storageKey = `shopify_portfolio:${storeId}:newsletter_subscribers`;
        const raw = localStorage.getItem(storageKey);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(email.trim().toLowerCase())) {
          list.push(email.trim().toLowerCase());
          localStorage.setItem(storageKey, JSON.stringify(list));
        }
      } catch {
        // Silently continue in restricted storage environments
      }

      setStatus('success');
    }, 450);
  };

  return (
    <section
      id={sectionId}
      data-section-type="newsletter-signup"
      className={cn(
        'w-full py-14 md:py-24 px-4 sm:px-6 lg:px-8',
        'bg-[var(--color-surface,#ffffff)] border-y border-[var(--color-border,#e5e7eb)]',
        className
      )}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light,#f3f4f6)] text-[var(--color-primary,#111827)] mx-auto flex items-center justify-center mb-5">
          <Mail className="w-6 h-6" aria-hidden="true" />
        </div>

        {/* Heading & Subheading */}
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text,#111827)] tracking-tight">
          {heading}
        </h2>
        {subheading && (
          <p className="font-body text-base text-[var(--color-text-muted,#6b7280)] mt-3">
            {subheading}
          </p>
        )}

        {/* Success State */}
        {status === 'success' ? (
          <div
            role="status"
            className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-card,0.75rem)] text-center animate-fade-in"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <h3 className="font-heading font-semibold text-emerald-900 dark:text-emerald-200 text-lg">
              Subscription Confirmed
            </h3>
            <p className="font-body text-sm text-emerald-700 dark:text-emerald-300 mt-1">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('');
                setStatus('idle');
              }}
              className="mt-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 underline hover:no-underline"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          /* Form Input */
          <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor={inputId} className="sr-only">
                Email address
              </label>
              <div className="relative flex-1">
                <input
                  id={inputId}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') {
                      setStatus('idle');
                      setErrorMessage('');
                    }
                  }}
                  placeholder={placeholder}
                  disabled={status === 'loading'}
                  aria-invalid={status === 'error'}
                  aria-describedby={status === 'error' ? errorId : disclaimerId}
                  className={cn(
                    'w-full h-11 px-4 text-sm font-body',
                    'bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#111827)]',
                    'border rounded-[var(--radius-btn,0.5rem)] transition-colors',
                    'placeholder:text-[var(--color-text-muted,#6b7280)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#111827)]',
                    status === 'error'
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[var(--color-border,#e5e7eb)]'
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={status === 'loading'}
                loadingText="Subscribing..."
                className="h-11 px-6 whitespace-nowrap"
              >
                {buttonText}
              </Button>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div
                id={errorId}
                role="alert"
                className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400 text-left"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Disclaimer Text */}
            {disclaimerText && (
              <p
                id={disclaimerId}
                className="text-xs text-[var(--color-text-muted,#6b7280)] mt-3 leading-normal"
              >
                {disclaimerText}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSignup;
