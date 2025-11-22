import React, { useState } from 'react';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { useAdminTenants } from '@/hooks/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Building2, CreditCard, Edit } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import type { TenantWithStats } from '@/hooks/admin/useAdminTenants';

const PLAN_OPTIONS = ['free', 'basic', 'premium', 'unlimited'] as const;
const STATUS_OPTIONS = ['active', 'suspended', 'cancelled'] as const;

const SubscriptionsManagement: React.FC = () => {
  const { isSuperAdmin, isLoading: loadingSuperAdmin } = useIsSuperAdmin();
  const { data: tenants = [], isLoading } = useAdminTenants();
  const queryClient = useQueryClient();
  
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [status, setStatus] = useState('');
  const [maxUsers, setMaxUsers] = useState<string>('');
  const [maxProducts, setMaxProducts] = useState<string>('');

  const updateSubscription = useMutation({
    mutationFn: async ({
      tenantId,
      subscription,
    }: {
      tenantId: string;
      subscription: {
        plan_name: string;
        status: string;
        max_users: number | null;
        max_products: number | null;
      };
    }) => {
      const { error } = await supabase
        .from('tenant_subscriptions')
        .update(subscription)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-tenants'] });
      toast.success('Subscrição atualizada com sucesso');
      setShowEditModal(false);
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast.error('Erro ao atualizar subscrição');
    },
  });

  const handleEditSubscription = (tenant: TenantWithStats) => {
    setSelectedTenant(tenant);
    setPlanName(tenant.subscription?.plan_name || 'free');
    setStatus(tenant.subscription?.status || 'active');
    setMaxUsers(tenant.subscription?.max_users?.toString() || '');
    setMaxProducts(tenant.subscription?.max_products?.toString() || '');
    setShowEditModal(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedTenant) return;

    await updateSubscription.mutateAsync({
      tenantId: selectedTenant.id,
      subscription: {
        plan_name: planName,
        status,
        max_users: maxUsers === '' ? null : parseInt(maxUsers),
        max_products: maxProducts === '' ? null : parseInt(maxProducts),
      },
    });
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
        title="Gestão de Subscrições"
        description="Gerir planos e limites de cada organização"
      />

      <Card>
        <CardHeader>
          <CardTitle>Subscrições Ativas</CardTitle>
          <CardDescription>
            {tenants.length} organiza{tenants.length !== 1 ? 'ções' : 'ção'} no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
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
                      {tenant.subscription && (
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {tenant.subscription.plan_name}
                          </Badge>
                          {tenant.subscription.max_users !== null && (
                            <span className="text-xs text-muted-foreground">
                              {tenant.stats.users}/{tenant.subscription.max_users} users
                            </span>
                          )}
                          {tenant.subscription.max_products !== null && (
                            <span className="text-xs text-muted-foreground">
                              {tenant.stats.products}/{tenant.subscription.max_products} produtos
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {tenant.subscription && (
                      <Badge
                        variant={tenant.subscription.status === 'active' ? 'default' : 'secondary'}
                      >
                        {tenant.subscription.status}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSubscription(tenant)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscription Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Subscrição</DialogTitle>
            <DialogDescription>
              {selectedTenant?.name} (@{selectedTenant?.slug})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={planName} onValueChange={setPlanName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Máximo de Utilizadores (vazio = ilimitado)</Label>
              <Input
                type="number"
                placeholder="Ilimitado"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Máximo de Produtos (vazio = ilimitado)</Label>
              <Input
                type="number"
                placeholder="Ilimitado"
                value={maxProducts}
                onChange={(e) => setMaxProducts(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSubscription}
              disabled={updateSubscription.isPending}
            >
              {updateSubscription.isPending ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement;
