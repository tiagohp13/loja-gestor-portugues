import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
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
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['all-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Tenant[];
    },
    enabled: isSuperAdmin,
  });

  const createTenantMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name: newTenantName,
          slug: newTenantSlug,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tenants'] });
      toast.success('Organização criada com sucesso');
      setShowCreateDialog(false);
      setNewTenantName('');
      setNewTenantSlug('');
    },
    onError: (error) => {
      console.error('Error creating tenant:', error);
      toast.error('Erro ao criar organização');
    },
  });

  const handleCreateTenant = () => {
    if (!newTenantName.trim() || !newTenantSlug.trim()) {
      toast.error('Nome e slug são obrigatórios');
      return;
    }
    createTenantMutation.mutate();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setNewTenantName(name);
    if (!newTenantSlug || newTenantSlug === generateSlug(newTenantName)) {
      setNewTenantSlug(generateSlug(name));
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

      {/* Create Tenant Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Organização</DialogTitle>
            <DialogDescription>
              Criar uma nova organização no sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Organização</Label>
              <Input
                id="name"
                value={newTenantName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Empresa ABC"
              />
            </div>
            
            <div>
              <Label htmlFor="slug">Slug (Identificador único)</Label>
              <Input
                id="slug"
                value={newTenantSlug}
                onChange={(e) => setNewTenantSlug(e.target.value)}
                placeholder="Ex: empresa-abc"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usado em URLs. Apenas letras minúsculas, números e hífens.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateTenant}
                disabled={createTenantMutation.isPending}
              >
                {createTenantMutation.isPending ? 'Criando...' : 'Criar Organização'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManagement;
