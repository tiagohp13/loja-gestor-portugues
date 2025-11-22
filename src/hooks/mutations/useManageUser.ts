import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sendEmail, EMAIL_TEMPLATES } from '@/services/emailService';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilizador não autenticado');

      // Get user email before suspending
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('user_id', userId)
        .single();

      // Call edge function to suspend user and invalidate sessions
      const { data, error } = await supabase.functions.invoke('suspend-user', {
        body: {
          userId,
          suspend,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Log audit action
      await supabase.rpc('log_user_audit', {
        p_admin_id: user.id,
        p_target_user_id: userId,
        p_action: suspend ? 'suspended' : 'reactivated',
        p_details: null,
      });

      return { userId, suspend, userEmail: userProfile?.email };
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-audit-logs', data.userId] });
      
      const action = data.suspend ? 'suspenso' : 'reativado';
      const userName = variables.userName || 'Utilizador';
      toast.success(`${userName} foi ${action} com sucesso${!data.suspend ? ' e a validade de acesso foi removida' : ''}`);

      // Send email notification if user has email
      if (data.userEmail) {
        const template = data.suspend 
          ? EMAIL_TEMPLATES.userSuspended 
          : EMAIL_TEMPLATES.userReactivated;
        
        await sendEmail({
          to: data.userEmail,
          subject: template.subject,
          text: template.text,
        });
      }
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
    mutationFn: async ({ userId, userName }: DeleteUserParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilizador não autenticado');

      // Check if user is trying to delete themselves
      if (userId === user.id) {
        throw new Error('Não pode eliminar a sua própria conta');
      }

      // Log audit action before deletion
      await supabase.rpc('log_user_audit', {
        p_admin_id: user.id,
        p_target_user_id: userId,
        p_action: 'deleted',
        p_details: { userName },
      });

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
