
// This file simply re-exports the pages to maintain backward compatibility
// Individual pages should be imported directly from their respective files

import { Navigate } from 'react-router-dom';

// Don't re-export components here; this is just a simple redirect
const Index = () => {
  // Redirect to Dashboard since this is the root route
  return <Navigate to="/dashboard" replace />;
};

export default Index;
