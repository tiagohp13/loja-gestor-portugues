import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Users, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useTenantUsers } from '@/hooks/admin/useTenantUsers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TenantEditData {
  id: string;
  name: string;
  slug: string;
  tax_id?: string | null;
  phone?: string | null;
  website?: string | null;
  industry_sector?: string | null;
  status: string;
  subscription?: {
    plan_name: string;
    status: string;
    created_at?: string;
    expires_at?: string | null;
  };
}

interface TenantEditModalProps {
  tenant: TenantEditData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INDUSTRY_SECTORS = [
  'Comércio',
  'Serviços',
  'Indústria',
  'Tecnologia',
  'Saúde',
  'Educação',
  'Construção',
  'Alimentação',
  'Transporte',
  'Outro'
];

const TenantEditModal: React.FC<TenantEditModalProps> = ({
  tenant,
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TenantEditData>({
    id: '',
    name: '',
    slug: '',
    tax_id: '',
    phone: '',
    website: '',
    industry_sector: '',
    status: 'active',
    subscription: undefined,
  });
  
  const { data: tenantUsers = [], isLoading: isLoadingUsers } = useTenantUsers(tenant?.id || null);
  const [userRoleChanges, setUserRoleChanges] = useState<Record<string, 'admin' | 'editor' | 'viewer'>>({});

  useEffect(() => {
    if (tenant) {
      // Fetch subscription data
      const fetchSubscription = async () => {
        const { data: subscription } = await supabase
          .from('tenant_subscriptions')
          .select('plan_name, status, created_at, expires_at')
          .eq('tenant_id', tenant.id)
          .single();
        
        setFormData({
          ...tenant,
          subscription: subscription || undefined,
        });
      };
      
      fetchSubscription();
      setUserRoleChanges({});
    }
  }, [tenant]);

  const validateNIF = (nif: string): boolean => {
    if (!nif) return true;
    return /^\d{9}$/.test(nif);
  };

  const handleUserRoleChange = (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    setUserRoleChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const getEffectiveRole = (userId: string, currentRole: string) => {
    return userRoleChanges[userId] || currentRole;
  };

  const hasAtLeastOneAdmin = () => {
    const effectiveRoles = tenantUsers.map(user => 
      getEffectiveRole(user.user_id, user.role)
    );
    return effectiveRoles.includes('admin');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da organização é obrigatório');
      return;
    }

    if (formData.tax_id && !validateNIF(formData.tax_id)) {
      toast.error('Introduza um NIF válido com 9 dígitos');
      return;
    }

    if (!hasAtLeastOneAdmin()) {
      toast.error('Tem de haver pelo menos um administrador na organização');
      return;
    }

    setIsSaving(true);

    try {
      // Update tenant info
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({
          name: formData.name,
          tax_id: formData.tax_id || null,
          phone: formData.phone || null,
          website: formData.website || null,
          industry_sector: formData.industry_sector || null,
          status: formData.status,
        })
        .eq('id', formData.id);

      if (tenantError) throw tenantError;

      // Update subscription if expires_at was changed
      if (formData.subscription) {
        const { error: subscriptionError } = await supabase
          .from('tenant_subscriptions')
          .update({
            expires_at: formData.subscription.expires_at || null,
          })
          .eq('tenant_id', formData.id);

        if (subscriptionError) throw subscriptionError;
      }

      // Update user roles if there are changes
      if (Object.keys(userRoleChanges).length > 0) {
        for (const [userId, newRole] of Object.entries(userRoleChanges)) {
          const { error: roleError } = await supabase
            .from('tenant_users')
            .update({ role: newRole })
            .eq('tenant_id', formData.id)
            .eq('user_id', userId);

          if (roleError) throw roleError;
        }
      }

      toast.success('Organização atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['all-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      toast.error(error.message || 'Erro ao atualizar organização');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Gerir Organização</DialogTitle>
              <DialogDescription>
                Atualize as informações da organização
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informação Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Informação Básica</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Organização *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: AquaParaíso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (não editável)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">NIF</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder="9 dígitos"
                  maxLength={9}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+351..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry_sector">Setor de Atividade</Label>
                <Select 
                  value={formData.industry_sector || ''} 
                  onValueChange={(value) => setFormData({ ...formData, industry_sector: value })}
                >
                  <SelectTrigger id="industry_sector">
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector.toLowerCase()}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plano Contratado</Label>
                <Input
                  id="plan"
                  value={formData.subscription?.plan_name || 'N/A'}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_start">Data de Início</Label>
                <Input
                  id="subscription_start"
                  type="date"
                  value={formData.subscription?.created_at?.split('T')[0] || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_end">Data de Fim (opcional)</Label>
                <Input
                  id="subscription_end"
                  type="date"
                  value={formData.subscription?.expires_at?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    subscription: {
                      ...formData.subscription!,
                      expires_at: e.target.value || null
                    }
                  })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Se não for preenchida, a subscrição será por tempo ilimitado
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Utilizadores da Organização */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Utilizadores da Organização</h3>
              {!hasAtLeastOneAdmin() && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Tem de haver pelo menos um administrador
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {isLoadingUsers ? (
              <div className="text-sm text-muted-foreground">A carregar utilizadores...</div>
            ) : tenantUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhum utilizador encontrado</div>
            ) : (
              <div className="space-y-3">
                {tenantUsers.map((user) => {
                  const effectiveRole = getEffectiveRole(user.user_id, user.role);
                  const isChanged = userRoleChanges[user.user_id] !== undefined;
                  
                  return (
                    <div
                      key={user.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isChanged ? 'bg-primary/5 border-primary/20' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {user.name || 'Sem nome'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      
                      <Select
                        value={effectiveRole}
                        onValueChange={(value: 'admin' | 'editor' | 'viewer') => 
                          handleUserRoleChange(user.user_id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="editor">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Editor
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Viewer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'A guardar...' : 'Guardar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TenantEditModal;
