import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserAuditLog {
  id: string;
  timestamp: string;
  admin_id: string;
  admin_name?: string;
  admin_email?: string;
  target_user_id: string;
  action: string;
  details?: Record<string, any>;
}

export const useUserAuditLogs = (userId: string) => {
  return useQuery({
    queryKey: ['user-audit-logs', userId],
    queryFn: async () => {
      // Get audit logs for this user
      const { data: logs, error } = await supabase
        .from('user_audit_logs')
        .select('id, timestamp, admin_id, target_user_id, action, details')
        .eq('target_user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      if (!logs || logs.length === 0) return [];

      // Get unique admin IDs
      const adminIds = [...new Set(logs.map(log => log.admin_id))];

      // Fetch admin profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', adminIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      return logs.map(log => {
        const profile = profileMap.get(log.admin_id);
        return {
          ...log,
          admin_name: profile?.name,
          admin_email: profile?.email,
        };
      }) as UserAuditLog[];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
