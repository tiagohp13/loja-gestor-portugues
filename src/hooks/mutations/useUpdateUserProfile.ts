import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from '../queries/useUserProfileQuery';

interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateProfileData }) => {
      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return updatedProfile as UserProfile;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    },
  });
};
