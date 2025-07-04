import { useUserProfile } from './useUserProfile';

export type AccessLevel = 'admin' | 'editor' | 'visualizador';

export const usePermissions = () => {
  const { profile, loading } = useUserProfile();
  
  const accessLevel = profile?.access_level as AccessLevel || 'visualizador';
  
  const isAdmin = accessLevel === 'admin';
  const isEditor = accessLevel === 'editor';
  const isViewer = accessLevel === 'visualizador';
  
  const canCreate = isAdmin || isEditor;
  const canEdit = isAdmin || isEditor;
  const canDelete = isAdmin;
  const canView = true; // All authenticated users can view
  
  const checkPermission = (action: 'create' | 'edit' | 'delete' | 'view') => {
    switch (action) {
      case 'create':
        return canCreate;
      case 'edit':
        return canEdit;
      case 'delete':
        return canDelete;
      case 'view':
        return canView;
      default:
        return false;
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