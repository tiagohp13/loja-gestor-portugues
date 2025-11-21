import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  totalSales: number;
  totalPurchases: number;
  totalOrders: number;
}

export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      // Count stock exits (sales) created by this user
      const { count: salesCount } = await supabase
        .from('stock_exits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // Count stock entries (purchases) created by this user
      const { count: purchasesCount } = await supabase
        .from('stock_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // Count orders created by this user
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      return {
        totalSales: salesCount || 0,
        totalPurchases: purchasesCount || 0,
        totalOrders: ordersCount || 0,
      } as UserStats;
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};
