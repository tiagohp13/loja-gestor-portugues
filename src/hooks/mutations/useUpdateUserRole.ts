import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'admin' | 'editor' | 'viewer';

interface UpdateUserRoleParams {
  userId: string;
  newRole: AppRole;
  userName?: string;
}

interface UpdateUserRoleOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to update user role in the user_roles table
 * Includes security validations:
 * - Prevents users from changing their own role
 * - Prevents removing the last admin
 */
export const useUpdateUserRole = (options?: UpdateUserRoleOptions) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, newRole }: UpdateUserRoleParams) => {
      // Security validation 1: Prevent self-modification
      if (currentUser?.id === userId) {
        throw new Error('Não pode alterar o seu próprio papel por motivos de segurança');
      }

      // Security validation 2: Check if this is the last admin
      if (newRole !== 'admin') {
        // Get current role
        const { data: currentRoleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (currentRoleData?.role === 'admin') {
          // Count total admins
          const { data: adminCount, error: countError } = await supabase
            .from('user_roles')
            .select('user_id', { count: 'exact', head: true })
            .eq('role', 'admin');

          if (countError) throw countError;

          // If this is the last admin, prevent downgrade
          if ((adminCount as any) <= 1) {
            throw new Error('Não pode remover o último administrador do sistema');
          }
        }
      }

      // Validate role value
      const validRoles: AppRole[] = ['admin', 'editor', 'viewer'];
      if (!validRoles.includes(newRole)) {
        throw new Error(`Papel inválido: ${newRole}`);
      }

      // Update role in user_roles table (NOT user_profiles for security)
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
        });

      if (insertError) throw insertError;

      // Also update access_level in user_profiles for backward compatibility
      // The trigger will sync this back to user_roles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ access_level: newRole })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error syncing profile:', profileError);
        // Don't throw, as the main operation succeeded
      }

      // Log the action for audit purposes
      console.info(`Role updated: User ${userId} changed to ${newRole} by ${currentUser?.id}`);

      return { userId, newRole };
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      const roleLabels = {
        admin: 'Administrador',
        editor: 'Editor',
        viewer: 'Visualizador',
      };

      const userName = variables.userName || 'Utilizador';
      toast.success(`Papel de ${userName} atualizado para ${roleLabels[data.newRole]}`);

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Erro ao atualizar papel do utilizador');
      
      options?.onError?.(error);
    },
  });
};
