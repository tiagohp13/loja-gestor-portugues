import { useScrollToTop } from '@/hooks/useScrollToTop';

/**
 * Component that scrolls to top on route changes
 * Place inside BrowserRouter to enable global scroll-to-top behavior
 */
export const ScrollToTop = () => {
  useScrollToTop();
  return null;
};
