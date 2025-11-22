import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_name: string;
  status: string;
  max_users: number | null;
  max_products: number | null;
  max_storage_gb: number | null;
  expires_at: string | null;
}

/**
 * Hook para obter informações da subscrição do tenant atual
 */
export const useTenantSubscription = () => {
  const { currentTenant } = useTenant();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['tenant-subscription', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('tenant_subscriptions')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      return data as TenantSubscription;
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isUnlimited = (value: number | null) => value === null;

  const limits = {
    users: {
      max: subscription?.max_users || null,
      isUnlimited: isUnlimited(subscription?.max_users || null),
    },
    products: {
      max: subscription?.max_products || null,
      isUnlimited: isUnlimited(subscription?.max_products || null),
    },
    storage: {
      max: subscription?.max_storage_gb || null,
      isUnlimited: isUnlimited(subscription?.max_storage_gb || null),
    },
  };

  return {
    subscription,
    limits,
    isLoading,
    error,
  };
};
