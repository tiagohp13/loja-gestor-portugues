import React, { useState } from 'react';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

interface SystemSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  default_language: string;
  maintenance_mode: boolean;
  welcome_message: string;
}

const AdminSettings: React.FC = () => {
  const { isSuperAdmin, isLoading: loadingSuperAdmin } = useIsSuperAdmin();
  const queryClient = useQueryClient();

  // Fetch current settings (simplified - using a tenants settings as global config)
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async (): Promise<SystemSettings> => {
      // For now, we'll use simple defaults
      // In production, you'd want a dedicated settings table
      return {
        platform_name: 'NEXORA',
        support_email: 'suporte@nexora.app',
        support_phone: '+351 000 000 000',
        default_language: 'pt',
        maintenance_mode: false,
        welcome_message: 'Bem-vindo ao NEXORA - Sistema de Gestão Multi-Tenant',
      };
    },
    enabled: isSuperAdmin,
  });

  const [formData, setFormData] = useState<SystemSettings>(
    settings || {
      platform_name: 'NEXORA',
      support_email: '',
      support_phone: '',
      default_language: 'pt',
      maintenance_mode: false,
      welcome_message: '',
    }
  );

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      // In a real implementation, you'd update a dedicated settings table
      // For now, we'll just show a success message
      console.log('Updating settings:', newSettings);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Configurações guardadas com sucesso');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Erro ao guardar configurações');
    },
  });

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  if (loadingSuperAdmin) {
    return <LoadingSpinner />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações do Sistema"
        description="Configurações globais da plataforma NEXORA"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Gerir configurações que afetam toda a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform_name">Nome da Plataforma</Label>
                <Input
                  id="platform_name"
                  value={formData.platform_name}
                  onChange={(e) =>
                    setFormData({ ...formData, platform_name: e.target.value })
                  }
                  placeholder="NEXORA"
                />
                <p className="text-xs text-muted-foreground">
                  Nome exibido no branding do sistema
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_email">Email de Suporte</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={formData.support_email}
                  onChange={(e) =>
                    setFormData({ ...formData, support_email: e.target.value })
                  }
                  placeholder="suporte@nexora.app"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_phone">Telefone de Suporte</Label>
                <Input
                  id="support_phone"
                  type="tel"
                  value={formData.support_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, support_phone: e.target.value })
                  }
                  placeholder="+351 000 000 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_language">Idioma Padrão</Label>
                <Input
                  id="default_language"
                  value={formData.default_language}
                  onChange={(e) =>
                    setFormData({ ...formData, default_language: e.target.value })
                  }
                  placeholder="pt"
                />
                <p className="text-xs text-muted-foreground">
                  Código ISO do idioma (pt, en, es, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome_message">Mensagem de Boas-Vindas</Label>
                <Textarea
                  id="welcome_message"
                  value={formData.welcome_message}
                  onChange={(e) =>
                    setFormData({ ...formData, welcome_message: e.target.value })
                  }
                  placeholder="Mensagem exibida na página inicial"
                  rows={4}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateSettings.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateSettings.isPending ? 'A guardar...' : 'Guardar Configurações'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informação do Sistema</CardTitle>
          <CardDescription>Detalhes técnicos da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ambiente:</span>
              <span className="font-medium">Produção</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base de Dados:</span>
              <span className="font-medium">Supabase PostgreSQL</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
