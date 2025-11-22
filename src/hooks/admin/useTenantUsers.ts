import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantUser {
  user_id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  status: string;
}

export const useTenantUsers = (tenantId: string | null) => {
  return useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('tenant_users')
        .select(`
          user_id,
          role,
          status,
          user_profiles!inner(
            email,
            name
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('role');

      if (error) throw error;

      // Transform and sort: admins first
      const users: TenantUser[] = (data || []).map((item: any) => ({
        user_id: item.user_id,
        email: item.user_profiles.email,
        name: item.user_profiles.name,
        role: item.role,
        status: item.status,
      }));

      // Sort: admins first, then by email
      return users.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return (a.email || '').localeCompare(b.email || '');
      });
    },
    enabled: !!tenantId,
    staleTime: 30 * 1000,
  });
};
