
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that scrolls the window to the top when the route changes
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Use requestAnimationFrame to ensure the scroll happens after the DOM is updated
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    
    // Try immediate scroll
    scrollToTop();
    
    // Also try after a frame to ensure DOM is ready
    requestAnimationFrame(scrollToTop);
    
    // Fallback after a short delay for heavy pages
    const timeout = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timeout);
  }, [pathname]);
};
