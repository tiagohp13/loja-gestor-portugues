import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantUser {
  user_id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor' | 'viewer' | 'super_admin';
  status: string;
}

export const useTenantUsers = (tenantId: string | null) => {
  return useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      // Fetch tenant users
      const { data: tenantUsersData, error: tenantUsersError } = await supabase
        .from('tenant_users')
        .select('user_id, role, status')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      if (tenantUsersError) {
        console.error('Error fetching tenant users:', tenantUsersError);
        throw tenantUsersError;
      }

      if (!tenantUsersData || tenantUsersData.length === 0) {
        return [];
      }

      // Fetch user profiles separately
      const userIds = tenantUsersData.map(tu => tu.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, email, name')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        throw profilesError;
      }

      // Combine data
      const users: TenantUser[] = tenantUsersData.map((tu) => {
        const profile = profilesData?.find(p => p.user_id === tu.user_id);
        return {
          user_id: tu.user_id,
          email: profile?.email || 'unknown',
          name: profile?.name || null,
          role: tu.role,
          status: tu.status,
        };
      });

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
