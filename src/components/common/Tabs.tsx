import React, { createContext, useContext, useState, useRef } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: 'line' | 'pill' | 'segmented';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs compound components must be rendered inside a <Tabs> parent.');
  return context;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  variant?: 'line' | 'pill' | 'segmented';
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  variant = 'line',
  children,
  className,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (val: string) => {
    if (value === undefined) setInternalTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn('w-full flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className, ...props }) => {
  const { variant } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const triggers = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!triggers || triggers.length === 0) return;

    const list = Array.from(triggers);
    const currentIndex = list.findIndex((btn) => btn === document.activeElement);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % list.length;
      list[nextIndex].focus();
      list[nextIndex].click();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + list.length) % list.length;
      list[prevIndex].focus();
      list[prevIndex].click();
    } else if (e.key === 'Home') {
      list[0].focus();
      list[0].click();
    } else if (e.key === 'End') {
      list[list.length - 1].focus();
      list[list.length - 1].click();
    }
  };

  const variantContainerStyles = {
    line: 'border-b border-[var(--color-border,#e4e4e7)] gap-6',
    pill: 'gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl',
    segmented: 'grid grid-flow-col auto-cols-fr gap-1 bg-neutral-200/60 dark:bg-neutral-800/60 p-1 rounded-lg',
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn('flex items-center', variantContainerStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className, ...props }) => {
  const { activeTab, setActiveTab, variant } = useTabsContext();
  const isSelected = activeTab === value;

  const variantTriggerStyles = {
    line: cn(
      'pb-3 pt-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]',
      isSelected
        ? 'border-[var(--color-primary,#111)] text-[var(--color-text,#111)] font-semibold'
        : 'border-transparent text-[var(--color-text-muted,#71717a)] hover:text-[var(--color-text,#111)]'
    ),
    pill: cn(
      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
      isSelected
        ? 'bg-[var(--color-surface,#fff)] text-[var(--color-text,#111)] shadow-xs'
        : 'text-[var(--color-text-muted,#71717a)] hover:text-[var(--color-text,#111)]'
    ),
    segmented: cn(
      'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all text-center',
      isSelected
        ? 'bg-[var(--color-surface,#fff)] text-[var(--color-text,#111)] shadow-xs font-semibold'
        : 'text-[var(--color-text-muted,#71717a)] hover:text-[var(--color-text,#111)]'
    ),
  };

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => setActiveTab(value)}
      className={cn(
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 select-none cursor-pointer',
        variantTriggerStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className, ...props }) => {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('mt-6 focus-visible:outline-none animate-in fade-in-50 duration-150', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Tabs;
