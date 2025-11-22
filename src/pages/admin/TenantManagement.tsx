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
import { Building2, Users, Settings, Plus, Trash2, UserPlus } from 'lucide-react';
import { TenantInfo } from '@/components/tenant/TenantInfo';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

interface AdditionalUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  phone?: string;
}

const PLAN_LIMITS = {
  free: { maxUsers: 1, maxProducts: 5 },
  basic: { maxUsers: 3, maxProducts: null },
  premium: { maxUsers: 10, maxProducts: null },
  unlimited: { maxUsers: null, maxProducts: null }
};

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
    isSuperAdminTenant: false,
    taxId: '',
    phone: '',
    website: '',
    industrySector: '',
    additionalUsers: []
  });

  const [additionalUsers, setAdditionalUsers] = useState<AdditionalUser[]>([]);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['all-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data as Tenant[];
    },
    enabled: isSuperAdmin,
  });

  const validateNIF = (nif: string): boolean => {
    if (!nif) return true; // Empty is valid (will be checked for required later)
    return /^\d{9}$/.test(nif);
  };

  const getMaxUsers = (plan: string): number | null => {
    return formData.isSuperAdminTenant ? null : PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.maxUsers || null;
  };

  const getRemainingSlots = (): number | null => {
    const maxUsers = getMaxUsers(formData.subscriptionPlan);
    if (maxUsers === null) return null; // Unlimited
    return maxUsers - 1 - additionalUsers.length; // -1 for admin principal
  };

  const canAddMoreUsers = (): boolean => {
    const remaining = getRemainingSlots();
    return remaining === null || remaining > 0;
  };

  const showUsersSection = (): boolean => {
    return formData.subscriptionPlan !== 'free' || formData.isSuperAdminTenant;
  };

  const addAdditionalUser = () => {
    if (!canAddMoreUsers()) {
      toast.error('Limite de utilizadores atingido para este plano');
      return;
    }

    setAdditionalUsers([...additionalUsers, {
      id: crypto.randomUUID(),
      name: '',
      email: '',
      role: 'viewer',
      phone: ''
    }]);
  };

  const removeAdditionalUser = (id: string) => {
    setAdditionalUsers(additionalUsers.filter(user => user.id !== id));
  };

  const updateAdditionalUser = (id: string, field: keyof AdditionalUser, value: string) => {
    setAdditionalUsers(additionalUsers.map(user =>
      user.id === id ? { ...user, [field]: value } : user
    ));
  };

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

    // Validar NIF
    const needsTaxId = (formData.subscriptionPlan === 'basic' || formData.subscriptionPlan === 'premium') && !formData.isSuperAdminTenant;
    if (needsTaxId && !formData.taxId?.trim()) {
      toast.error('NIF é obrigatório para planos Basic e Premium');
      return;
    }

    if (formData.taxId && !validateNIF(formData.taxId)) {
      toast.error('Introduza um NIF válido com 9 dígitos');
      return;
    }

    // Validar utilizadores adicionais
    for (const user of additionalUsers) {
      if (!user.name.trim()) {
        toast.error('Nome completo é obrigatório para todos os utilizadores');
        return;
      }
      if (!user.email.trim() || !user.email.includes('@')) {
        toast.error('Email válido é obrigatório para todos os utilizadores');
        return;
      }
    }

    // Verificar emails duplicados
    const allEmails = [formData.adminEmail, ...additionalUsers.map(u => u.email)];
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== allEmails.length) {
      toast.error('Existem emails duplicados na lista de utilizadores');
      return;
    }

    try {
      await createOrganization.mutateAsync({
        ...formData,
        additionalUsers: additionalUsers.map(({ id, ...user }) => user)
      });
      
      setShowCreateDialog(false);
      
      // Resetar form
      setFormData({
        tenantName: '',
        adminEmail: '',
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        subscriptionStartsAt: new Date().toISOString().split('T')[0],
        notes: '',
        isSuperAdminTenant: false,
        taxId: '',
        phone: '',
        website: '',
        industrySector: '',
        additionalUsers: []
      });
      setAdditionalUsers([]);
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
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-muted-foreground">@{tenant.slug}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{tenant.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nova Organização */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Organização</DialogTitle>
            <DialogDescription>
              Criar uma nova organização na plataforma NEXORA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informação Básica */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informação Básica</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Nome da Organização *</Label>
                  <Input
                    id="tenantName"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    placeholder="Ex: AquaParaíso"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">
                    NIF {(formData.subscriptionPlan === 'basic' || formData.subscriptionPlan === 'premium') && !formData.isSuperAdminTenant && '*'}
                  </Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="9 dígitos"
                    maxLength={9}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+351..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="industrySector">Setor de Atividade</Label>
                  <Select value={formData.industrySector} onValueChange={(value) => setFormData({ ...formData, industrySector: value })}>
                    <SelectTrigger id="industrySector">
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
              </div>
            </div>

            <Separator />

            {/* Plano de Subscrição */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Plano de Subscrição</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPlan">Plano *</Label>
                  <Select 
                    value={formData.subscriptionPlan} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, subscriptionPlan: value as any });
                      // Reset additional users if switching to free
                      if (value === 'free' && !formData.isSuperAdminTenant) {
                        setAdditionalUsers([]);
                      }
                    }}
                    disabled={formData.isSuperAdminTenant}
                  >
                    <SelectTrigger id="subscriptionPlan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (1 user, 5 products)</SelectItem>
                      <SelectItem value="basic">Basic (3 users, unlimited products)</SelectItem>
                      <SelectItem value="premium">Premium (10 users, unlimited products)</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionStatus">Estado *</Label>
                  <Select value={formData.subscriptionStatus} onValueChange={(value) => setFormData({ ...formData, subscriptionStatus: value as any })}>
                    <SelectTrigger id="subscriptionStatus">
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
                  <Label htmlFor="subscriptionStartsAt">Data de Início *</Label>
                  <Input
                    id="subscriptionStartsAt"
                    type="date"
                    value={formData.subscriptionStartsAt}
                    onChange={(e) => setFormData({ ...formData, subscriptionStartsAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  id="isSuperAdminTenant"
                  checked={formData.isSuperAdminTenant}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSuperAdminTenant: checked as boolean })}
                />
                <Label htmlFor="isSuperAdminTenant" className="cursor-pointer">
                  Tenant Interno (Unlimited) - apenas super admin
                </Label>
              </div>
            </div>

            <Separator />

            {/* Administrador Principal */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Administrador Principal</h3>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email do Administrador *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="admin@empresa.com"
                />
                <p className="text-xs text-muted-foreground">
                  Este utilizador terá role de <strong>admin</strong> na organização
                </p>
              </div>
            </div>

            {/* Utilizadores Adicionais */}
            {showUsersSection() && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Utilizadores desta organização</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getRemainingSlots() === null 
                          ? 'Utilizadores ilimitados' 
                          : `${1 + additionalUsers.length} / ${getMaxUsers(formData.subscriptionPlan)} utilizadores utilizados`
                        }
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAdditionalUser}
                      disabled={!canAddMoreUsers()}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Adicionar Utilizador
                    </Button>
                  </div>

                  {additionalUsers.length > 0 && (
                    <div className="space-y-4">
                      {additionalUsers.map((user) => (
                        <div key={user.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="grid gap-3 flex-1 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Nome Completo *</Label>
                                <Input
                                  value={user.name}
                                  onChange={(e) => updateAdditionalUser(user.id, 'name', e.target.value)}
                                  placeholder="João Silva"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                  type="email"
                                  value={user.email}
                                  onChange={(e) => updateAdditionalUser(user.id, 'email', e.target.value)}
                                  placeholder="joao@empresa.com"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Role *</Label>
                                <Select value={user.role} onValueChange={(value) => updateAdditionalUser(user.id, 'role', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                  value={user.phone}
                                  onChange={(e) => updateAdditionalUser(user.id, 'phone', e.target.value)}
                                  placeholder="+351..."
                                />
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="ml-2"
                              onClick={() => removeAdditionalUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Notas Internas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Internas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas opcionais sobre esta organização..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
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
              {createOrganization.isPending ? 'A criar...' : 'Criar Organização'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManagement;
