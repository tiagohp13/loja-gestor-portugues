import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { toast } from 'sonner';

export interface AdminUser {
  user_id: string;
  email: string;
  name: string;
  is_super_admin: boolean;
  tenants: Array<{
    tenant_id: string;
    tenant_name: string;
    role: string;
    status: string;
  }>;
}

/**
 * Hook para buscar todos os utilizadores do sistema
 * Apenas para super admins
 */
export const useAdminUsers = () => {
  const { isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['admin-all-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      // Fetch all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, email, name')
        .order('name');

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // For each user, get their tenants and super admin status
      const usersWithDetails = await Promise.all(
        profiles.map(async (profile) => {
          // Check if super admin
          const { data: systemRole } = await supabase
            .from('user_system_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .eq('role', 'super_admin')
            .maybeSingle();

          // Get user's tenants
          const { data: tenantUsers } = await supabase
            .from('tenant_users')
            .select(`
              tenant_id,
              role,
              status,
              tenants (
                name
              )
            `)
            .eq('user_id', profile.user_id);

          const tenants = (tenantUsers || []).map((tu: any) => ({
            tenant_id: tu.tenant_id,
            tenant_name: tu.tenants?.name || 'Unknown',
            role: tu.role,
            status: tu.status,
          }));

          return {
            user_id: profile.user_id,
            email: profile.email || '',
            name: profile.name || '',
            is_super_admin: !!systemRole,
            tenants,
          };
        })
      );

      // Sort: Super admins first, then alphabetically by name
      return usersWithDetails.sort((a, b) => {
        // Super admins always come first
        if (a.is_super_admin && !b.is_super_admin) return -1;
        if (!a.is_super_admin && b.is_super_admin) return 1;
        
        // Within the same group, sort alphabetically by name
        return (a.name || a.email).localeCompare(b.name || b.email, 'pt-PT');
      });
    },
    enabled: isSuperAdmin,
    staleTime: 30 * 1000,
  });
};

// Email do super admin protegido que nunca pode ser removido
const PROTECTED_SUPER_ADMIN_EMAIL = 'tiagohp13@hotmail.com';

/**
 * Hook para alternar o status de super admin de um utilizador
 */
export const useToggleSuperAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isSuperAdmin, email }: { userId: string; isSuperAdmin: boolean; email: string }) => {
      // Proteger o super admin principal
      if (email === PROTECTED_SUPER_ADMIN_EMAIL && isSuperAdmin) {
        throw new Error('Este super administrador não pode ser removido');
      }

      if (isSuperAdmin) {
        // Remove super admin
        const { error } = await supabase
          .from('user_system_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'super_admin');

        if (error) throw error;
      } else {
        // Add super admin
        const { error } = await supabase
          .from('user_system_roles')
          .insert({
            user_id: userId,
            role: 'super_admin',
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast.success('Status de super admin atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error toggling super admin:', error);
      toast.error('Erro ao atualizar status de super admin');
    },
  });
};
