import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SuspensionHistoryEntry {
  id: string;
  action: 'suspended' | 'reactivated';
  reason: string | null;
  performed_by: string | null;
  performer_name?: string;
  created_at: string;
}

export const useUserSuspensionHistory = (userId: string) => {
  return useQuery({
    queryKey: ['user-suspension-history', userId],
    queryFn: async () => {
      // First, get suspension history
      const { data, error } = await supabase
        .from('user_suspension_history')
        .select('id, action, reason, performed_by, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get unique performer IDs
      const performerIds = [...new Set(data.map(entry => entry.performed_by).filter(Boolean))];

      // Fetch performer profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', performerIds as string[]);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      return data.map(entry => {
        const profile = entry.performed_by ? profileMap.get(entry.performed_by) : null;
        return {
          ...entry,
          performer_name: profile?.name || profile?.email || 'Sistema',
        };
      }) as SuspensionHistoryEntry[];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
