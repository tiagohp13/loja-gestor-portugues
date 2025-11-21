import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface UserAuthInfo {
  lastLogin: string | null;
  lastLoginFormatted: string | null;
  lastIpAddress: string | null;
  lastUserAgent: string | null;
  deviceType: string | null;
}

export const useUserAuthInfo = (userId: string) => {
  return useQuery({
    queryKey: ['user-auth-info', userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-user-auth-info', {
          body: { userId },
        });

        if (error) {
          console.error('Error fetching user auth info:', error);
          return null;
        }

        if (!data?.success || !data?.data) {
          return null;
        }

        const authInfo = data.data;
        const deviceType = authInfo.lastUserAgent 
          ? (authInfo.lastUserAgent.toLowerCase().includes('mobile') ? 'Telemóvel' : 'PC')
          : null;

        return {
          lastLogin: authInfo.lastLogin,
          lastLoginFormatted: authInfo.lastLogin 
            ? formatDistanceToNow(new Date(authInfo.lastLogin), { addSuffix: true, locale: ptBR })
            : null,
          lastIpAddress: authInfo.lastIpAddress,
          lastUserAgent: authInfo.lastUserAgent,
          deviceType,
        } as UserAuthInfo;
      } catch (error) {
        console.error('Error fetching auth info:', error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
