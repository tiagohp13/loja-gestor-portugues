import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActivity: string;
  userAgent: string;
}

export const useActiveSessions = (userId: string) => {
  return useQuery({
    queryKey: ['active-sessions', userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-user-sessions', {
          body: { userId },
        });

        if (error) {
          console.error('Error fetching sessions:', error);
          return [];
        }

        if (!data?.success || !data?.sessions) {
          return [];
        }

        return data.sessions as ActiveSession[];
      } catch (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
