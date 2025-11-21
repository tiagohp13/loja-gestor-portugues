import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, Shield, Trash } from 'lucide-react';
import { useUserProfileQuery } from '@/hooks/queries/useUserProfileQuery';
import { useUserProfileForm } from '@/hooks/useUserProfileForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const UserProfileForm: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfileQuery();
  
  const {
    profile: formProfile,
    uploading,
    loading: submitting,
    handleInputChange,
    handleAvatarUpload,
    handleAvatarRemove,
    handleSubmit,
  } = useUserProfileForm({
    userId: user?.id || '',
    initialProfile: profile || null,
    onSuccess: () => {
      // Profile updated successfully
    },
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!formProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Utilizador</CardTitle>
          <CardDescription>Perfil não encontrado</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
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
              <AvatarImage src={formProfile.avatar_url} alt="Profile picture" />
              <AvatarFallback className="text-lg">
                {getInitials(formProfile.name)}
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
                {formProfile.avatar_url && formProfile.avatar_url !== '' && (
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
                Imagens quadradas recomendadas (max 5MB, JPG/PNG/WEBP)
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input 
              id="name" 
              value={formProfile.name || ''} 
              onChange={e => handleInputChange('name', e.target.value)} 
              placeholder="Introduza o seu nome"
              maxLength={100}
              autoFocus={false}
            />
          </div>

          {/* Email Field (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="px-3 py-2 border border-input rounded-md bg-muted text-sm">
              {formProfile.email || 'Nenhum email associado'}
            </div>
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado e está associado à sua conta
            </p>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={formProfile.phone || ''} 
              onChange={e => handleInputChange('phone', e.target.value)} 
              placeholder="+351 912 345 678"
              maxLength={20}
            />
          </div>

          {/* Access Level (read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Nível de Acesso
            </Label>
            <Badge variant={formProfile.access_level === 'admin' ? 'default' : 'secondary'} className="w-fit">
              <Shield className="h-4 w-4 mr-2" />
              {formProfile.access_level === 'admin' ? 'Administrador' : 
               formProfile.access_level === 'editor' ? 'Editor' : 'Visualizador'}
            </Badge>
            <p className="text-xs text-muted-foreground">
              O nível de acesso só pode ser alterado por um administrador na secção "Configuração de Acessos"
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'A guardar...' : 'Guardar alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
