import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';

interface AdminStats {
  totalTenants: number;
  totalUsers: number;
  totalProducts: number;
  activeTenants: number;
}

/**
 * Hook para buscar estatísticas globais do painel administrativo
 * Apenas para super admins
 */
export const useAdminStats = () => {
  const { isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Count total tenants
      const { count: tenantsCount, error: tenantsError } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true });

      if (tenantsError) throw tenantsError;

      // Count active tenants
      const { count: activeTenantsCount, error: activeTenantsError } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeTenantsError) throw activeTenantsError;

      // Count total users (from tenant_users)
      const { count: usersCount, error: usersError } = await supabase
        .from('tenant_users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (usersError) throw usersError;

      // Count total products across all tenants
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (productsError) throw productsError;

      return {
        totalTenants: tenantsCount || 0,
        activeTenants: activeTenantsCount || 0,
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
      };
    },
    enabled: isSuperAdmin,
    staleTime: 30 * 1000, // 30 seconds
  });
};
