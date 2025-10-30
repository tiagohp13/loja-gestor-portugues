import { useUserProfile } from './useUserProfile';
import { useRolePermissions } from './useRolePermissions';

export type AccessLevel = 'admin' | 'editor' | 'viewer';

/**
 * Hook unificado de permissões
 * Usa o novo sistema RBAC mas mantém compatibilidade com o código existente
 */
export const usePermissions = () => {
  const { profile, loading } = useUserProfile();
  const rbac = useRolePermissions();
  
  // Usar o role do RBAC se disponível, senão fallback para access_level
  const accessLevel = (rbac.role || profile?.access_level || 'viewer') as AccessLevel;
  
  const isAdmin  = accessLevel === 'admin';
  const isEditor = accessLevel === 'editor';
  const isViewer = accessLevel === 'viewer';
  
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
    loading: loading || rbac.isLoading,
    // Novas funcionalidades RBAC
    can: rbac.can,
    hasRole: rbac.hasRole,
    hasAnyRole: rbac.hasAnyRole,
    roleName: rbac.roleName,
  };
};
