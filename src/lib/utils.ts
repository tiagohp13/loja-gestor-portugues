
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to combine class names with Tailwind CSS
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper for consistent component heights across the dashboard
 * @returns Boolean indicating whether DOM is available
 */
export const matchComponentHeights = () => {
  if (typeof window !== 'undefined') {
    // This function would be called after components are mounted
    // to ensure consistent heights between paired components
    return true;
  }
  return false;
}
