
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add a helper for consistent component heights across the dashboard
export const matchComponentHeights = () => {
  if (typeof window !== 'undefined') {
    // This function would be called after components are mounted
    // to ensure consistent heights between paired components
    return true;
  }
  return false;
}
