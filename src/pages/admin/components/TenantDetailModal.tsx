import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2, Users, Package, TrendingUp, ShoppingCart, Calendar, Phone, Globe, Briefcase, FileText } from 'lucide-react';

interface TenantStats {
  users: number;
  products: number;
  sales: number;
  clients?: number;
  orders?: number;
  stockEntries?: number;
}

interface TenantSubscription {
  plan_name: string;
  status: string;
  expires_at?: string | null;
  max_users?: number | null;
  max_products?: number | null;
}

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  tax_id?: string | null;
  phone?: string | null;
  website?: string | null;
  industry_sector?: string | null;
  created_at: string;
  stats: TenantStats;
  subscription?: TenantSubscription;
}

interface TenantDetailModalProps {
  tenant: TenantDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  tenant,
  open,
  onOpenChange,
}) => {
  if (!tenant) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{tenant.name}</DialogTitle>
              <DialogDescription>@{tenant.slug}</DialogDescription>
            </div>
            <Badge 
              variant="outline" 
              className={
                tenant.status === 'active' 
                  ? 'ml-auto bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
                  : 'ml-auto bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800'
              }
            >
              {tenant.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informação Básica */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Informação Básica</h3>
            <div className="grid grid-cols-2 gap-4">
              {tenant.tax_id && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">NIF</p>
                    <p className="text-sm font-medium">{tenant.tax_id}</p>
                  </div>
                </div>
              )}
              {tenant.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{tenant.phone}</p>
                  </div>
                </div>
              )}
              {tenant.website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a 
                      href={tenant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {tenant.website}
                    </a>
                  </div>
                </div>
              )}
              {tenant.industry_sector && (
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Setor</p>
                    <p className="text-sm font-medium capitalize">{tenant.industry_sector}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Data de Criação</p>
                  <p className="text-sm font-medium">{formatDate(tenant.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscrição */}
          {tenant.subscription && (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Subscrição</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Plano</p>
                    <p className="text-sm font-medium capitalize">{tenant.subscription.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <Badge variant="outline" className="mt-1">
                      {tenant.subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Limite de Utilizadores</p>
                    <p className="text-sm font-medium">
                      {tenant.subscription.max_users === null ? 'Ilimitado' : tenant.subscription.max_users}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Limite de Produtos</p>
                    <p className="text-sm font-medium">
                      {tenant.subscription.max_products === null ? 'Ilimitado' : tenant.subscription.max_products}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Estatísticas */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Utilizadores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tenant.stats.users}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Produtos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tenant.stats.products}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tenant.stats.sales}</div>
                </CardContent>
              </Card>

              {tenant.stats.clients !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tenant.stats.clients}</div>
                  </CardContent>
                </Card>
              )}

              {tenant.stats.orders !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      Encomendas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tenant.stats.orders}</div>
                  </CardContent>
                </Card>
              )}

              {tenant.stats.stockEntries !== undefined && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      Entradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tenant.stats.stockEntries}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDetailModal;
