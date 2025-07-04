import { useUserProfile } from './useUserProfile';

export type AccessLevel = 'admin' | 'editor' | 'viewer';

export const usePermissions = () => {
  const { profile, loading } = useUserProfile();
  
  const accessLevel = (profile?.access_level as AccessLevel) || 'viewer';
  
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
    loading
  };
};
