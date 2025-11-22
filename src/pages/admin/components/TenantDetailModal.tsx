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
import { Button } from '@/components/ui/button';
import { Building2, Users, Package, TrendingUp, ShoppingCart, Calendar, Phone, Globe, Briefcase, FileText, CreditCard, Settings, Mail, Shield } from 'lucide-react';
import { useTenantUsers } from '@/hooks/admin/useTenantUsers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  onEdit?: () => void;
}

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  tenant,
  open,
  onOpenChange,
  onEdit,
}) => {
  const { data: tenantUsers = [], isLoading: isLoadingUsers } = useTenantUsers(tenant?.id || null);
  
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
          <div className="flex items-center justify-between gap-3">
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
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800'
                }
              >
                {tenant.status}
              </Badge>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Settings className="h-4 w-4 mr-2" />
                Gerir
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Subscrição - PRIMEIRO */}
          {tenant.subscription && (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Plano de Subscrição
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Informação sobre o plano e limites
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Plano</p>
                      <p className="text-sm font-medium capitalize">{tenant.subscription.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <Badge 
                        variant="outline" 
                        className={
                          tenant.subscription.status === 'active'
                            ? 'mt-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
                            : 'mt-1'
                        }
                      >
                        {tenant.subscription.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Limite de Utilizadores</p>
                      <p className="text-sm font-medium">
                        {tenant.subscription.max_users === null ? 'Ilimitado' : `${tenant.stats.users} / ${tenant.subscription.max_users}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Limite de Produtos</p>
                      <p className="text-sm font-medium">
                        {tenant.subscription.max_products === null ? 'Ilimitado' : `${tenant.stats.products} / ${tenant.subscription.max_products}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Separator />
            </>
          )}

          {/* Dados Fiscais e Contacto */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Dados Fiscais e Contacto</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(() => {
                // Encontrar o administrador correto: priorizar super_admin, depois admin que não seja "Convidado"
                const admin = tenantUsers.find(u => u.role === 'super_admin') || 
                              tenantUsers.find(u => u.role === 'admin' && u.name !== 'Convidado') ||
                              tenantUsers.find(u => u.role === 'admin');
                
                return admin ? (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Administrador</p>
                      <p className="text-sm font-medium">
                        {admin.name || admin.email}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
              {tenant.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{tenant.phone}</p>
                  </div>
                </div>
              )}
              {tenant.tax_id && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">NIF</p>
                    <p className="text-sm font-medium">{tenant.tax_id}</p>
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

          {/* Utilizadores da Organização */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Utilizadores da Organização
            </h3>
            {isLoadingUsers ? (
              <div className="text-sm text-muted-foreground">A carregar...</div>
            ) : tenantUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nenhum utilizador encontrado
              </div>
            ) : (
              <div className="space-y-3">
                {tenantUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
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
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : user.role === 'editor'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
                          : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400'
                      }
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

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
