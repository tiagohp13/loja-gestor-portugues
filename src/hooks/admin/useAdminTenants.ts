import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';

export interface TenantWithStats {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  settings: any;
  tax_id?: string | null;
  phone?: string | null;
  website?: string | null;
  industry_sector?: string | null;
  subscription?: {
    plan_name: string;
    status: string;
    max_users: number | null;
    max_products: number | null;
    expires_at: string | null;
  };
  stats: {
    users: number;
    products: number;
    sales: number;
    clients: number;
    orders: number;
    stockEntries: number;
  };
}

/**
 * Hook para buscar todos os tenants com suas estatísticas
 * Apenas para super admins
 */
export const useAdminTenants = () => {
  const { isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['admin-all-tenants'],
    queryFn: async (): Promise<TenantWithStats[]> => {
      // Fetch all tenants
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('name');

      if (tenantsError) throw tenantsError;
      if (!tenants) return [];

      // Fetch stats for each tenant
      const tenantsWithStats = await Promise.all(
        tenants.map(async (tenant) => {
          // Get subscription
          const { data: subscription } = await supabase
            .from('tenant_subscriptions')
            .select('plan_name, status, max_users, max_products, expires_at')
            .eq('tenant_id', tenant.id)
            .single();

          // Count users
          const { count: usersCount } = await supabase
            .from('tenant_users')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .eq('status', 'active');

          // Count products
          const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .is('deleted_at', null);

          // Count sales (stock exits)
          const { count: salesCount } = await supabase
            .from('stock_exits')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .is('deleted_at', null);

          // Count clients
          const { count: clientsCount } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .is('deleted_at', null);

          // Count orders
          const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .is('deleted_at', null);

          // Count stock entries
          const { count: entriesCount } = await supabase
            .from('stock_entries')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .is('deleted_at', null);

          return {
            ...tenant,
            subscription: subscription || undefined,
            stats: {
              users: usersCount || 0,
              products: productsCount || 0,
              sales: salesCount || 0,
              clients: clientsCount || 0,
              orders: ordersCount || 0,
              stockEntries: entriesCount || 0,
            },
          };
        })
      );

      return tenantsWithStats;
    },
    enabled: isSuperAdmin,
    staleTime: 30 * 1000, // 30 seconds
  });
};
