import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'warning'
    | 'danger'
    | 'sale';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulseDot?: boolean;
  icon?: React.ReactNode;
}

const BADGE_VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  primary: 'bg-[var(--color-primary,#111)] text-[var(--color-surface,#fff)]',
  secondary: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  outline: 'border border-[var(--color-border,#e5e7eb)] text-[var(--color-text,#111)] bg-transparent',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  sale: 'bg-red-600 text-white font-bold tracking-wide uppercase',
};

const BADGE_SIZES: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  pulseDot = false,
  icon,
  className,
  children,
  ...restProps
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-badge,9999px)] transition-colors select-none',
        BADGE_VARIANTS[variant],
        BADGE_SIZES[size],
        className
      )}
      {...restProps}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulseDot && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
