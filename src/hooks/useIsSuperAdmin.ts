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
      if (!user) {
        console.log('🔍 useIsSuperAdmin: Sem utilizador autenticado');
        return false;
      }

      console.log('🔍 useIsSuperAdmin: Verificando para utilizador:', user.email);

      const { data, error } = await supabase
        .from('user_system_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking super admin:', error);
        return false;
      }

      const result = !!data;
      console.log('🔍 useIsSuperAdmin resultado:', result ? '✅ É SUPER ADMIN' : '❌ NÃO é super admin');
      return result;
    },
    // CRÍTICO: Sem staleTime para garantir recalculo em cada sessão
    staleTime: 0,
    gcTime: 0, // Não manter em cache após unmount
  });

  return {
    isSuperAdmin,
    isLoading,
  };
};
