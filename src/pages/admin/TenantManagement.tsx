import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { useCreateOrganization, CreateOrganizationData } from '@/hooks/admin/useCreateOrganization';
import { Navigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Settings, Plus } from 'lucide-react';
import { TenantInfo } from '@/components/tenant/TenantInfo';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

const TenantManagement: React.FC = () => {
  const { isSuperAdmin, isLoading: superAdminLoading } = useIsSuperAdmin();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const createOrganization = useCreateOrganization();

  // Form state
  const [formData, setFormData] = useState<CreateOrganizationData>({
    tenantName: '',
    adminEmail: '',
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    subscriptionStartsAt: new Date().toISOString().split('T')[0],
    notes: '',
    isSuperAdminTenant: false
  });

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['all-tenants'],
    queryFn: async () => {
      console.log('Fetching all tenants...');
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching tenants:', error);
        throw error;
      }
      
      console.log('Tenants fetched:', data);
      return data as Tenant[];
    },
    enabled: isSuperAdmin,
  });

  const handleSubmit = async () => {
    // Validar campos obrigatórios
    if (!formData.tenantName.trim()) {
      toast.error('Nome da organização é obrigatório');
      return;
    }

    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      toast.error('Email do administrador inválido');
      return;
    }

    try {
      await createOrganization.mutateAsync(formData);
      setShowCreateDialog(false);
      // Resetar form
      setFormData({
        tenantName: '',
        adminEmail: '',
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        subscriptionStartsAt: new Date().toISOString().split('T')[0],
        notes: '',
        isSuperAdminTenant: false
      });
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  if (superAdminLoading) {
    return <LoadingSpinner />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestão de Organizações"
        description="Gerir organizações e subscrições (Super Admin)"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Organizações Ativas</CardTitle>
            <CardDescription>Total de organizações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenants.length}</div>
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-2">
          <TenantInfo />
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Todas as Organizações</CardTitle>
            <CardDescription>Lista completa de organizações do sistema</CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Organização
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma organização encontrada. Crie a primeira organização.
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-muted-foreground">{tenant.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                      {tenant.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Utilizadores
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Organização</DialogTitle>
            <DialogDescription>
              Criar uma nova organização no sistema NEXORA
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Campos Obrigatórios */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Campos Obrigatórios</h3>
              
              <div>
                <Label htmlFor="name">Nome da Organização *</Label>
                <Input
                  id="name"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  placeholder="Ex: Empresa ABC"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email do Administrador *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="admin@empresa.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se o utilizador não existir, será criado automaticamente e receberá um email com password temporária.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan">Plano de Subscrição *</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value: any) => setFormData({ ...formData, subscriptionPlan: value })}
                    disabled={formData.isSuperAdminTenant}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (1 user, 5 produtos)</SelectItem>
                      <SelectItem value="basic">Basic (3 users, ilimitado)</SelectItem>
                      <SelectItem value="premium">Premium (10 users, ilimitado)</SelectItem>
                      <SelectItem value="unlimited">Unlimited (ilimitado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Estado da Subscrição *</Label>
                  <Select
                    value={formData.subscriptionStatus}
                    onValueChange={(value: any) => setFormData({ ...formData, subscriptionStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="suspended">Suspensa</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="startDate">Data de Início da Subscrição *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.subscriptionStartsAt}
                  onChange={(e) => setFormData({ ...formData, subscriptionStartsAt: e.target.value })}
                />
              </div>
            </div>

            {/* Campos Opcionais */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Campos Opcionais</h3>
              
              <div>
                <Label htmlFor="notes">Notas Internas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre esta organização..."
                  rows={3}
                />
              </div>
            </div>

            {/* Campos Avançados */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Configurações Avançadas (Super Admin)</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internal"
                  checked={formData.isSuperAdminTenant}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      isSuperAdminTenant: checked as boolean,
                      subscriptionPlan: checked ? 'unlimited' : 'free'
                    })
                  }
                />
                <Label htmlFor="internal" className="font-normal cursor-pointer">
                  Tenant Interno (Unlimited)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Se marcado, força o plano para unlimited ignorando a seleção acima. Usar apenas para tenants internos de teste ou demonstração.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={createOrganization.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createOrganization.isPending}
              >
                {createOrganization.isPending ? 'Criando...' : 'Criar Organização'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManagement;
