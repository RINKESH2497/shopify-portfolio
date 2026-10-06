import React, { useState, useId, useMemo } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqAccordionSettings } from '../../types/section';
import { cn } from '../../utils/cn';

export interface FaqAccordionProps {
  settings: FaqAccordionSettings;
  id?: string;
  className?: string;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  settings,
  id,
  className,
}) => {
  const {
    heading = 'Frequently Asked Questions',
    subheading,
    items = [],
    allowMultipleOpen = false,
  } = settings;

  const sectionId = id || useId();

  // Multi-open and single-open state management
  const [openSingleIndex, setOpenSingleIndex] = useState<number | null>(0);
  const [openMultiIndices, setOpenMultiIndices] = useState<Set<number>>(new Set([0]));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories extracted if present
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all' || categories.length === 0) return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory, categories]);

  const toggleItem = (index: number) => {
    if (allowMultipleOpen) {
      setOpenMultiIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    } else {
      setOpenSingleIndex((prev) => (prev === index ? null : index));
    }
  };

  const isItemOpen = (index: number) => {
    return allowMultipleOpen ? openMultiIndices.has(index) : openSingleIndex === index;
  };

  if (items.length === 0) return null;

  return (
    <section
      id={sectionId}
      data-section-type="faq-accordion"
      className={cn('w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8', className)}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light,#f3f4f6)] text-[var(--color-primary,#111827)] mx-auto flex items-center justify-center mb-4">
            <HelpCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text,#111827)] tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="font-body text-base text-[var(--color-text-muted,#6b7280)] mt-3">
              {subheading}
            </p>
          )}
        </div>

        {/* Optional Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors',
                selectedCategory === 'all'
                  ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              )}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors',
                  selectedCategory === cat
                    ? 'bg-[var(--color-primary,#111827)] text-[var(--color-surface,#ffffff)]'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Accordion List */}
        <div className="space-y-3" role="region" aria-label="Accordion items">
          {filteredItems.map((item, index) => {
            const isOpen = isItemOpen(index);
            const questionId = `${sectionId}-q-${index}`;
            const panelId = `${sectionId}-p-${index}`;

            return (
              <div
                key={index}
                className={cn(
                  'bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e5e7eb)]',
                  'rounded-[var(--radius-card,0.75rem)] overflow-hidden transition-colors'
                )}
              >
                <h3>
                  <button
                    id={questionId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(index)}
                    className={cn(
                      'w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors',
                      'hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#111827)]'
                    )}
                  >
                    <span className="font-heading font-semibold text-base sm:text-lg text-[var(--color-text,#111827)] pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-[var(--color-text-muted,#6b7280)] shrink-0 transition-transform duration-300',
                        isOpen && 'rotate-180 text-[var(--color-primary,#111827)]'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                {/* Smooth Expandable Content Panel */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={questionId}
                  hidden={!isOpen}
                  className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 font-body text-sm sm:text-base text-[var(--color-text-muted,#6b7280)] leading-relaxed border-t border-[var(--color-border,#e5e7eb)]/60">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
