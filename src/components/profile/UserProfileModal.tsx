import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface UserProfile {
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

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || '',
    name: '',
    email: user?.email || '',
    phone: '',
    language: 'pt',
    theme: 'system',
    access_level: 'visualizador',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchProfile();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          ...data,
          email: data.email || user.email || ''
        });
      } else {
        // If no profile exists, set default values with user's email
        setProfile(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      toast.success('Avatar carregado com sucesso');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao carregar avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileData: any = {
        user_id: user.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        language: profile.language,
        theme: profile.theme,
        access_level: profile.access_level,
        avatar_url: profile.avatar_url
      };

      // Include id if profile already exists
      if (profile.id) {
        profileData.id = profile.id;
      }

      console.log('Updating profile with data:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Profile updated successfully:', data);
      toast.success('Perfil atualizado com sucesso');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Perfil do Utilizador</DialogTitle>
          <DialogDescription>
            Gerencie as suas informações pessoais e preferências
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} alt="Profile picture" />
              <AvatarFallback className="text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-modal" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground">
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? 'A carregar...' : 'Alterar foto'}</span>
                </div>
              </Label>
              <input
                id="avatar-modal"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Imagens quadradas recomendadas (1:1)
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name-modal">Nome</Label>
            <Input
              id="name-modal"
              value={profile.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Introduza o seu nome"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email-modal">Email</Label>
            <Input
              id="email-modal"
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Introduza o seu email"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone-modal">Telefone (opcional)</Label>
            <Input
              id="phone-modal"
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Introduza o seu telefone"
            />
          </div>

          {/* Language Field */}
          <div className="space-y-2">
            <Label htmlFor="language-modal">Idioma Preferido</Label>
            <Select
              value={profile.language || 'pt'}
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">Inglês</SelectItem>
                <SelectItem value="es">Espanhol</SelectItem>
                <SelectItem value="fr">Francês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'A guardar...' : 'Guardar alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;