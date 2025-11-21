import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface UserActivity {
  id: string;
  action_type: string;
  action_description: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  created_at: string;
  formatted_time: string;
}

export const useUserLastActivity = (userId: string) => {
  return useQuery({
    queryKey: ['user-last-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user activity:', error);
        return null;
      }

      if (!data) return null;

      return {
        ...data,
        formatted_time: formatDistanceToNow(new Date(data.created_at), {
          addSuffix: true,
          locale: ptBR,
        }),
      } as UserActivity;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUserActivityHistory = (userId: string, limit = 10) => {
  return useQuery({
    queryKey: ['user-activity-history', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user activity history:', error);
        return [];
      }

      return (data || []).map(activity => ({
        ...activity,
        formatted_time: formatDistanceToNow(new Date(activity.created_at), {
          addSuffix: true,
          locale: ptBR,
        }),
      })) as UserActivity[];
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};
