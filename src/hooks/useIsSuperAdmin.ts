import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para verificar se o usuário atual é super admin
 * Super admins têm acesso global a todos os tenants
 */
export const useIsSuperAdmin = () => {
  const { data: isSuperAdmin = false, isLoading } = useQuery({
    queryKey: ['is-super-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_system_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking super admin:', error);
        return false;
      }

      return !!data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    isSuperAdmin,
    isLoading,
  };
};
