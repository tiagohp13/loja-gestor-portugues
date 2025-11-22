import { useTenant } from '@/contexts/TenantContext';

export type TenantRole = 'admin' | 'editor' | 'viewer';

/**
 * Hook para verificar o role do usuário no tenant atual
 */
export const useTenantRole = () => {
  const { currentTenant, userTenants, isLoading } = useTenant();

  // Encontrar o role do usuário no tenant atual
  const currentUserTenant = userTenants.find(t => t.isCurrent);
  const role = currentUserTenant?.userRole || 'viewer';

  const isAdmin = role === 'admin';
  const isEditor = role === 'editor';
  const isViewer = role === 'viewer';
  
  const canCreate = isAdmin || isEditor;
  const canEdit = isAdmin || isEditor;
  const canDelete = isAdmin;
  const canView = true; // Todos os membros do tenant podem ver

  const hasRole = (requiredRole: TenantRole) => {
    if (requiredRole === 'viewer') return true;
    if (requiredRole === 'editor') return isAdmin || isEditor;
    if (requiredRole === 'admin') return isAdmin;
    return false;
  };

  return {
    role,
    isAdmin,
    isEditor,
    isViewer,
    canCreate,
    canEdit,
    canDelete,
    canView,
    hasRole,
    isLoading,
    currentTenant,
  };
};
