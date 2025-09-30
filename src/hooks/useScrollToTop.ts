import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that scrolls the window to the top when the route changes
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Force immediate scroll to top
    window.scrollTo(0, 0);
    
    // Also scroll the document element
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
};
