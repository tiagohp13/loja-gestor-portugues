import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Package, TrendingUp, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Navigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

interface TenantStats {
  users: number;
  products: number;
  sales: number;
}

const AdminPanelDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: loadingSuperAdmin } = useIsSuperAdmin();

  // Fetch all tenants
  const { data: tenants, isLoading: loadingTenants } = useQuery({
    queryKey: ['admin-tenants'],
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

  // Fetch stats for each tenant (simplified for now)
  const { data: tenantsStats } = useQuery({
    queryKey: ['admin-tenant-stats'],
    queryFn: async () => {
      if (!tenants) return {};
      
      const stats: Record<string, TenantStats> = {};
      
      for (const tenant of tenants) {
        // Count users
        const { count: usersCount } = await supabase
          .from('tenant_users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'active');

        // Count products
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .is('deleted_at', null);

        // Sum sales (simplified)
        const { data: exits } = await supabase
          .from('stock_exits')
          .select('discount')
          .eq('tenant_id', tenant.id)
          .is('deleted_at', null);

        stats[tenant.id] = {
          users: usersCount || 0,
          products: productsCount || 0,
          sales: exits?.length || 0,
        };
      }
      
      return stats;
    },
    enabled: !!tenants && tenants.length > 0,
  });

  const handleEnterTenant = async (tenantId: string) => {
    try {
      // Switch tenant context
      await supabase.rpc('switch_tenant', { _tenant_id: tenantId });
      
      // Navigate to ERP dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error switching tenant:', error);
    }
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
        title="Painel Administrativo"
        description="Gestão global da plataforma NEXORA"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Clientes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizadores Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantsStats ? Object.values(tenantsStats).reduce((sum, t) => sum + t.users, 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Em todas as organizações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Totais</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantsStats ? Object.values(tenantsStats).reduce((sum, t) => sum + t.products, 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Em todas as organizações</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizações</CardTitle>
          <CardDescription>
            Clique numa organização para entrar no respetivo ERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTenants ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {tenants?.map((tenant) => {
                const stats = tenantsStats?.[tenant.id];
                
                return (
                  <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{tenant.name}</h3>
                            <p className="text-sm text-muted-foreground">@{tenant.slug}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {stats && (
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{stats.users}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span>{stats.products}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span>{stats.sales}</span>
                              </div>
                            </div>
                          )}
                          
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {tenant.status}
                          </Badge>

                          <Button
                            onClick={() => handleEnterTenant(tenant.id)}
                            variant="default"
                            size="sm"
                            className="gap-2"
                          >
                            Entrar no ERP
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanelDashboard;
