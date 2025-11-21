import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUpdateUserProfile } from './mutations/useUpdateUserProfile';
import { UserProfile } from './queries/useUserProfileQuery';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UseUserProfileFormProps {
  userId: string;
  initialProfile: UserProfile | null;
  onSuccess?: () => void;
}

export const useUserProfileForm = ({ userId, initialProfile, onSuccess }: UseUserProfileFormProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [uploading, setUploading] = useState(false);
  const updateProfileMutation = useUpdateUserProfile();

  // Sync profile state when initialProfile changes
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const validateName = (name: string): boolean => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      toast.error('O nome não pode estar vazio');
      return false;
    }
    if (trimmed.length > 100) {
      toast.error('O nome não pode ter mais de 100 caracteres');
      return false;
    }
    return true;
  };

  const validatePhone = (phone: string): boolean => {
    const trimmed = phone.trim();
    if (trimmed.length === 0) return true; // Phone is optional
    
    // Basic phone validation - digits, spaces, +, -, ()
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneRegex.test(trimmed)) {
      toast.error('Número de telefone inválido');
      return false;
    }
    if (trimmed.length > 20) {
      toast.error('O telefone não pode ter mais de 20 caracteres');
      return false;
    }
    return true;
  };

  const validateImageFile = (file: File): boolean => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Formato de imagem inválido. Use JPG, PNG ou WEBP');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('A imagem não pode ter mais de 5MB');
      return false;
    }
    return true;
  };

  const handleInputChange = useCallback((field: keyof UserProfile, value: string) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (!validateImageFile(file)) {
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      // Remove old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfileMutation.mutateAsync({
        userId,
        data: { avatar_url: publicUrl }
      });

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao fazer upload do avatar');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [profile, userId, updateProfileMutation]);

  const handleAvatarRemove = useCallback(async () => {
    if (!profile?.avatar_url) return;

    setUploading(true);

    try {
      // Remove from storage
      const avatarPath = profile.avatar_url.split('/').pop();
      if (avatarPath) {
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([avatarPath]);

        if (storageError) {
          console.error('Error removing from storage:', storageError);
        }
      }

      // Update profile to remove avatar_url
      await updateProfileMutation.mutateAsync({
        userId,
        data: { avatar_url: null as any }
      });

      setProfile(prev => prev ? { ...prev, avatar_url: undefined } : null);
      toast.success('Avatar removido com sucesso!');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Erro ao remover avatar');
    } finally {
      setUploading(false);
    }
  }, [profile, userId, updateProfileMutation]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const name = profile.name?.trim() || '';
    const phone = profile.phone?.trim() || '';

    if (!validateName(name)) return;
    if (!validatePhone(phone)) return;

    try {
      await updateProfileMutation.mutateAsync({
        userId,
        data: {
          name: name || undefined,
          phone: phone || undefined,
        }
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [profile, userId, updateProfileMutation, onSuccess]);

  return {
    profile,
    uploading,
    loading: updateProfileMutation.isPending,
    handleInputChange,
    handleAvatarUpload,
    handleAvatarRemove,
    handleSubmit,
  };
};
