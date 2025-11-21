import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id?: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  language?: string;
  theme?: string;
  access_level?: string;
  avatar_url?: string;
}

export const useUserProfileQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, user_id, name, email, phone, avatar_url, theme, language, access_level, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data as UserProfile | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
