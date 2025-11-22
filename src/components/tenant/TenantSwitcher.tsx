import React from 'react';
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TenantSwitcherProps {
  className?: string;
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({ className }) => {
  const { currentTenant, userTenants, switchTenant, isLoading } = useTenant();
  const { isSuperAdmin } = useIsSuperAdmin();

  if (isLoading || !currentTenant) {
    return (
      <Button variant="outline" disabled className={cn('w-[200px]', className)}>
        <Building2 className="mr-2 h-4 w-4" />
        A carregar...
      </Button>
    );
  }

  const handleSwitchTenant = async (tenantId: string) => {
    if (tenantId === currentTenant.id) return;
    await switchTenant(tenantId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('w-[200px] justify-between', className)}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentTenant.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>Organizações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.tenantId}
            onSelect={() => handleSwitchTenant(tenant.tenantId)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                tenant.isCurrent ? 'opacity-100' : 'opacity-0'
              )}
            />
            <div className="flex-1 truncate">{tenant.tenantName}</div>
            <Badge variant="outline" className="ml-2 text-xs">
              {tenant.userRole}
            </Badge>
          </DropdownMenuItem>
        ))}
        
        {isSuperAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Nova Organização
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
