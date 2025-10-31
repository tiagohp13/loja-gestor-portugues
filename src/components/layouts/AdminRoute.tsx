import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that only allows admin users to access
 * Redirects non-admin users to the dashboard
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = usePermissions();

  // Show loading state while checking permissions
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect non-admin users to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Allow admin users to access the route
  return <>{children}</>;
};

export default AdminRoute;
