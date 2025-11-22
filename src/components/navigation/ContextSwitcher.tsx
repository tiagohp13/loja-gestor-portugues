import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextSwitcherProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * Componente para alternar entre Admin Panel e ERP do tenant
 * Apenas visível para super admins
 */
export const ContextSwitcher: React.FC<ContextSwitcherProps> = ({ 
  className,
  variant = 'outline'
}) => {
  const { isSuperAdmin } = useIsSuperAdmin();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  // Apenas mostrar para super admins
  if (!isSuperAdmin) {
    return null;
  }

  // Determinar se estamos no admin panel ou no ERP
  const isInAdminPanel = location.pathname.startsWith('/admin-panel');

  const handleSwitch = () => {
    if (isInAdminPanel) {
      // Ir para o ERP do tenant atual
      navigate('/dashboard');
    } else {
      // Voltar ao painel administrativo
      navigate('/admin-panel/dashboard');
    }
  };

  return (
    <Button
      onClick={handleSwitch}
      variant={variant}
      size="sm"
      className={cn('gap-2', className)}
    >
      {isInAdminPanel ? (
        <>
          <Building2 className="h-4 w-4" />
          Entrar no ERP ({currentTenant?.name || 'AquaParaíso'})
        </>
      ) : (
        <>
          <ArrowLeft className="h-4 w-4" />
          Painel Administrativo
        </>
      )}
    </Button>
  );
};
