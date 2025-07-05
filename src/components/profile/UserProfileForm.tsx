import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Upload, Shield, Trash } from 'lucide-react';
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
const UserProfileForm: React.FC = () => {
  const {
    user
  } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || '',
    name: '',
    email: user?.email || '',
    phone: '',
    language: 'pt',
    theme: 'system',
    access_level: 'viewer',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (user) {
      fetchProfile();
      checkAdminStatus();
    }
  }, [user]);
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
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
  const checkAdminStatus = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.rpc('is_user_admin');
      if (!error) {
        setIsAdmin(data);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const {
        error: uploadError
      } = await supabase.storage.from('avatars').upload(fileName, file, {
        upsert: true
      });
      if (uploadError) throw uploadError;
      const {
        data
      } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setProfile(prev => ({
        ...prev,
        avatar_url: data.publicUrl
      }));
      toast.success('Avatar carregado com sucesso');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao carregar avatar');
    } finally {
      setUploading(false);
    }
  };
  const handleAvatarRemove = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => ({
        ...prev,
        avatar_url: null
      }));
      toast.success('Foto removida com sucesso');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Erro ao remover foto');
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
        phone: profile.phone,
        language: profile.language,
        theme: profile.theme,
        avatar_url: profile.avatar_url
      };

      // Include id if profile already exists
      if (profile.id) {
        profileData.id = profile.id;
      }
      console.log('Updating profile with data:', profileData);
      const {
        data,
        error
      } = await supabase.from('user_profiles').upsert(profileData, {
        onConflict: 'user_id'
      }).select();
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
  return <Card>
      <CardHeader>
        <CardTitle>Perfil do Utilizador</CardTitle>
        <CardDescription>
          Gerencie as suas informações pessoais e preferências
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} alt="Profile picture" />
              <AvatarFallback className="text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground">
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'A carregar...' : 'Alterar foto'}</span>
                  </div>
                </Label>
                {profile.avatar_url && profile.avatar_url !== '' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarRemove}
                    disabled={uploading}
                    className="px-3 py-2 h-auto"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="ml-2">Remover foto</span>
                  </Button>
                )}
              </div>
              <input id="avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
              <p className="text-xs text-muted-foreground">
                Imagens quadradas recomendadas (1:1)
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={profile.name || ''} onChange={e => handleInputChange('name', e.target.value)} placeholder="Introduza o seu nome" />
          </div>

          {/* Email Field (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="px-3 py-2 border border-input rounded-md bg-muted text-sm">
              {profile.email || 'Nenhum email associado'}
            </div>
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado e está associado à sua conta
            </p>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input id="phone" type="tel" value={profile.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} placeholder="Introduza o seu telefone" />
          </div>

          {/* Language Field */}
          

          {/* Theme Field */}
          

          {/* Access Level (read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Nível de Acesso
            </Label>
            <Badge variant={profile.access_level === 'admin' ? 'default' : 'secondary'} className="w-fit">
              <Shield className="h-4 w-4 mr-2" />
              {profile.access_level === 'admin' ? 'Administrador' : 
               profile.access_level === 'editor' ? 'Editor' : 'Visualizador'}
            </Badge>
            <p className="text-xs text-muted-foreground">
              O nível de acesso só pode ser alterado por um administrador na secção "Configuração de Acessos"
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'A guardar...' : 'Guardar alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>;
};
export default UserProfileForm;