import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserAuthLog {
  timestamp: string;
  event: string;
  ip_address?: string;
  user_agent?: string;
  city?: string;
  country?: string;
}

export const useUserAuthLogs = (userId: string) => {
  return useQuery({
    queryKey: ['user-auth-logs', userId],
    queryFn: async () => {
      try {
        // Query auth logs from Supabase analytics
        const query = `
          select 
            auth_logs.timestamp, 
            event_message, 
            metadata.msg,
            metadata.path
          from auth_logs
          cross join unnest(metadata) as metadata
          where event_message like '%${userId}%'
          order by timestamp desc
          limit 10
        `;
        
        const { data, error } = await supabase.rpc('pg_stat_statements_reset' as any);
        
        // Since we can't directly query analytics, return empty for now
        // This would need to be implemented via an edge function with proper analytics access
        return {
          lastLogin: null as string | null,
          lastLocation: null as string | null,
          lastDevice: null as string | null,
          loginHistory: [] as UserAuthLog[],
        };
      } catch (error) {
        console.error('Error fetching auth logs:', error);
        return {
          lastLogin: null,
          lastLocation: null,
          lastDevice: null,
          loginHistory: [],
        };
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};
