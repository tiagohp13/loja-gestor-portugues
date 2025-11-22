import { useUserProfileQuery } from './queries/useUserProfileQuery';
import { useRolePermissions } from './useRolePermissions';
import { useTenantRole } from './useTenantRole';
import { useIsSuperAdmin } from './useIsSuperAdmin';

export type AccessLevel = 'admin' | 'editor' | 'viewer';

/**
 * Hook unificado de permissões
 * Agora integra o sistema multi-tenancy com RBAC
 * Prioridade: Super Admin > Tenant Role > RBAC > Access Level
 */
export const usePermissions = () => {
  const { data: profile, isLoading: loading } = useUserProfileQuery();
  const rbac = useRolePermissions();
  const tenantRole = useTenantRole();
  const { isSuperAdmin, isLoading: superAdminLoading } = useIsSuperAdmin();
  
  // Determinar nível de acesso com prioridades
  const accessLevel = (() => {
    if (isSuperAdmin) return 'admin';
    if (tenantRole.role) return tenantRole.role;
    if (rbac.role) return rbac.role;
    return (profile?.access_level || 'viewer') as AccessLevel;
  })();
  
  const isAdmin  = isSuperAdmin || accessLevel === 'admin';
  const isEditor = accessLevel === 'editor';
  const isViewer = accessLevel === 'viewer';
  
  console.log('🔐 usePermissions:', {
    isSuperAdmin,
    accessLevel,
    isAdmin,
    role: rbac.role,
    tenantRole: tenantRole.role,
  });
  
  const canCreate = isAdmin || isEditor;
  const canEdit   = isAdmin || isEditor;
  const canDelete = isAdmin;
  const canView   = true; // todos os autenticados podem ver
  
  const checkPermission = (action: 'create' | 'edit' | 'delete' | 'view') => {
    switch (action) {
      case 'create': return canCreate;
      case 'edit':   return canEdit;
      case 'delete': return canDelete;
      case 'view':   return canView;
      default:       return false;
    }
  };
  
  return {
    accessLevel,
    isAdmin,
    isEditor,
    isViewer,
    canCreate,
    canEdit,
    canDelete,
    canView,
    checkPermission,
    loading: loading || rbac.isLoading || tenantRole.isLoading || superAdminLoading,
    // RBAC funcionalidades
    can: rbac.can,
    hasRole: rbac.hasRole,
    hasAnyRole: rbac.hasAnyRole,
    roleName: rbac.roleName,
    // Multi-tenancy funcionalidades
    isSuperAdmin,
    tenantRole: tenantRole.role,
    currentTenant: tenantRole.currentTenant,
  };
};
