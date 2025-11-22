import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings?: Record<string, any>;
}

interface UserTenant {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  userRole: 'admin' | 'editor' | 'viewer';
  isCurrent: boolean;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  userTenants: UserTenant[];
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  // Carregar tenant atual do contexto do usuário
  const { data: contextData, isLoading: contextLoading } = useQuery({
    queryKey: ['user-context'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_contexts')
        .select('current_tenant_id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Carregar dados do tenant atual
  const { data: tenantData, isLoading: tenantLoading } = useQuery({
    queryKey: ['current-tenant', contextData?.current_tenant_id],
    queryFn: async () => {
      if (!contextData?.current_tenant_id) return null;

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', contextData.current_tenant_id)
        .single();

      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!contextData?.current_tenant_id,
    staleTime: 5 * 60 * 1000,
  });

  // Carregar lista de tenants do usuário
  const { data: userTenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['user-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_tenants');
      
      if (error) throw error;
      
      return (data || []).map((t: any) => ({
        tenantId: t.tenant_id,
        tenantName: t.tenant_name,
        tenantSlug: t.tenant_slug,
        userRole: t.user_role,
        isCurrent: t.is_current,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para trocar de tenant
  const switchTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const { data, error } = await supabase.rpc('switch_tenant', {
        _tenant_id: tenantId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar todas as queries para recarregar dados do novo tenant
      queryClient.invalidateQueries();
      toast.success('Organização alterada com sucesso');
    },
    onError: (error: any) => {
      console.error('Error switching tenant:', error);
      toast.error('Erro ao trocar de organização');
    },
  });

  // Atualizar tenant atual quando os dados mudarem
  useEffect(() => {
    if (tenantData) {
      setCurrentTenant(tenantData);
    }
  }, [tenantData]);

  const switchTenant = async (tenantId: string) => {
    await switchTenantMutation.mutateAsync(tenantId);
  };

  const refreshTenants = () => {
    queryClient.invalidateQueries({ queryKey: ['user-tenants'] });
    queryClient.invalidateQueries({ queryKey: ['user-context'] });
  };

  const isLoading = contextLoading || tenantLoading || tenantsLoading;

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        userTenants,
        isLoading,
        switchTenant,
        refreshTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
