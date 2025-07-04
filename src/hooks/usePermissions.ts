import { useUserProfile } from './useUserProfile';

export type AccessLevel = 'admin' | 'editor' | 'viewer';

const accessLevel = profile?.access_level as AccessLevel || 'viewer';
const isViewer   = accessLevel === 'viewer';

const canCreate = isAdmin || isEditor;
const canEdit   = isAdmin || isEditor;
const canDelete = isAdmin;
const canView   = true;

  
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