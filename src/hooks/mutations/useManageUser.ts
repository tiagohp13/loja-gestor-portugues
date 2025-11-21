import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuspendUserParams {
  userId: string;
  suspend: boolean;
  userName?: string;
}

interface DeleteUserParams {
  userId: string;
  userName?: string;
}

/**
 * Hook para suspender/reativar utilizadores
 */
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, suspend }: SuspendUserParams) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_suspended: suspend })
        .eq('user_id', userId);

      if (error) throw error;

      return { userId, suspend };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      
      const action = data.suspend ? 'suspenso' : 'reativado';
      const userName = variables.userName || 'Utilizador';
      toast.success(`${userName} foi ${action} com sucesso`);
    },
    onError: (error: Error) => {
      console.error('Error suspending user:', error);
      toast.error('Erro ao atualizar estado do utilizador');
    },
  });
};

/**
 * Hook para eliminar utilizadores permanentemente
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: DeleteUserParams) => {
      // First, delete from user_roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Then, delete from user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Note: We can't delete from auth.users via client
      // This would need to be done via edge function with service role
      // For now, we just remove the profile and role data

      return { userId };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-stats'] });
      
      const userName = variables.userName || 'Utilizador';
      toast.success(`${userName} foi eliminado com sucesso`);
    },
    onError: (error: Error) => {
      console.error('Error deleting user:', error);
      toast.error('Erro ao eliminar utilizador');
    },
  });
};
