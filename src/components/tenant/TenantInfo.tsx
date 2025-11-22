import React from 'react';
import { Building2, Users, Package, HardDrive } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantSubscription } from '@/hooks/useTenantSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const TenantInfo: React.FC = () => {
  const { currentTenant } = useTenant();
  const { subscription, limits } = useTenantSubscription();

  if (!currentTenant || !subscription) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>{currentTenant.name}</CardTitle>
          </div>
          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
            {subscription.plan_name}
          </Badge>
        </div>
        <CardDescription>Informações da organização e limites</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Limite de Usuários */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Utilizadores</span>
            </div>
            <span className="text-muted-foreground">
              {limits.users.isUnlimited ? 'Ilimitado' : `0 / ${limits.users.max}`}
            </span>
          </div>
          {!limits.users.isUnlimited && (
            <Progress value={0} className="h-2" />
          )}
        </div>

        {/* Limite de Produtos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Produtos</span>
            </div>
            <span className="text-muted-foreground">
              {limits.products.isUnlimited ? 'Ilimitado' : `0 / ${limits.products.max}`}
            </span>
          </div>
          {!limits.products.isUnlimited && (
            <Progress value={0} className="h-2" />
          )}
        </div>

        {/* Limite de Armazenamento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span>Armazenamento</span>
            </div>
            <span className="text-muted-foreground">
              {limits.storage.isUnlimited ? 'Ilimitado' : `0 GB / ${limits.storage.max} GB`}
            </span>
          </div>
          {!limits.storage.isUnlimited && (
            <Progress value={0} className="h-2" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
