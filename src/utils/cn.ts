import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names using `clsx` and resolves Tailwind CSS class
 * conflicts using `tailwind-merge`.
 *
 * @param inputs - Array of class strings, expressions, objects, or arrays
 * @returns Deduplicated, normalized class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;
