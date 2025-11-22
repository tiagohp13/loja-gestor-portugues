import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
          <Button>
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
    </div>
  );
};

export default TenantManagement;
