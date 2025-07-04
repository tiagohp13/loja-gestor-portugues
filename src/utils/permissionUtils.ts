import { toast } from 'sonner';

export const showPermissionError = (action: string) => {
  toast.error(`Não tem permissão para ${action}. Contacte o administrador.`);
};

export const validatePermission = (hasPermission: boolean, action: string): boolean => {
  if (!hasPermission) {
    showPermissionError(action);
    return false;
  }
  return true;
};