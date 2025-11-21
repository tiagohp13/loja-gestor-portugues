import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, Shield } from 'lucide-react';
import { useUserProfileQuery } from '@/hooks/queries/useUserProfileQuery';
import { useUserProfileForm } from '@/hooks/useUserProfileForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfileQuery();
  
  const {
    profile: formProfile,
    uploading,
    loading: submitting,
    handleInputChange,
    handleAvatarUpload,
    handleAvatarRemove,
    handleSubmit: handleFormSubmit,
  } = useUserProfileForm({
    userId: user?.id || '',
    initialProfile: profile || null,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (open && !profile && !isLoading) {
      // Profile will be loaded by the query
    }
  }, [open, profile, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    handleFormSubmit(e);
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

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : !formProfile ? (
          <div className="p-8 text-center text-muted-foreground">
            Perfil não encontrado
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formProfile.avatar_url} alt="Profile picture" />
                <AvatarFallback className="text-lg">
                  {getInitials(formProfile.name)}
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
                  Max 5MB, JPG/PNG/WEBP
                </p>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="modal-name">Nome *</Label>
              <Input
                id="modal-name"
                value={formProfile.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
              <Label htmlFor="modal-phone">Telefone (opcional)</Label>
              <Input
                id="modal-phone"
                type="tel"
                value={formProfile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
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
            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
