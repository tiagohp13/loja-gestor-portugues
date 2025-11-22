import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that ONLY allows SUPER ADMIN users to access
 * Redirects non-super-admin users (including regular tenant admins) to the dashboard
 * 
 * CRITICAL SECURITY: This route is for the NEXORA Admin Panel only
 */
const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { isSuperAdmin, isLoading } = useIsSuperAdmin();

  // Show loading state while checking permissions
  if (isLoading) {
    console.log('🔐 SuperAdminRoute: Verificando se é super admin...');
    return <LoadingSpinner />;
  }

  console.log('🔐 SuperAdminRoute: isSuperAdmin=', isSuperAdmin);

  // Redirect non-super-admin users to dashboard
  if (!isSuperAdmin) {
    console.log('❌ SuperAdminRoute: NÃO é super admin, redirecionando para /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ SuperAdminRoute: É SUPER ADMIN, acesso permitido ao painel administrativo');
  // Allow super admin users to access the route
  return <>{children}</>;
};

export default SuperAdminRoute;
