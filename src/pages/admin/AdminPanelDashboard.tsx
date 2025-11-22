import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { useAdminStats, useAdminTenants, TenantWithStats } from '@/hooks/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Package, TrendingUp, ArrowRight, Info } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Navigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import TenantDetailModal from './components/TenantDetailModal';

const AdminPanelDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: loadingSuperAdmin } = useIsSuperAdmin();
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(null);
  
  // Fetch global stats
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  
  // Fetch all tenants with their stats
  const { data: tenants = [], isLoading: loadingTenants } = useAdminTenants();

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
            <div className="text-2xl font-bold">{loadingStats ? '...' : stats?.activeTenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalTenants || 0} total{stats?.totalTenants !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizadores Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '...' : stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Em todas as organizações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Totais</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '...' : stats?.totalProducts || 0}</div>
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
              {tenants.length === 0 && !loadingTenants ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma organização encontrada
                </div>
              ) : (
                tenants.map((tenant) => (
                  <Card 
                    key={tenant.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTenant(tenant)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{tenant.name}</h3>
                            <p className="text-sm text-muted-foreground">@{tenant.slug}</p>
                            {tenant.subscription && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Plano: {tenant.subscription.plan_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1" title="Utilizadores">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{tenant.stats.users}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Produtos">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{tenant.stats.products}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Vendas">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span>{tenant.stats.sales}</span>
                            </div>
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className={
                              tenant.status === 'active' 
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800'
                            }
                          >
                            {tenant.status}
                          </Badge>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnterTenant(tenant.id);
                            }}
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
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <TenantDetailModal 
        tenant={selectedTenant}
        open={!!selectedTenant}
        onOpenChange={(open) => !open && setSelectedTenant(null)}
      />
    </div>
  );
};

export default AdminPanelDashboard;
