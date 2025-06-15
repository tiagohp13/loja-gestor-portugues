import { useState, useEffect } from 'react';
import { KPI } from '@/components/statistics/KPIPanel';
import { fetchSupportStats } from './api/fetchSupportStats';
import { generateKPIs } from './utils/kpiUtils';
import { SupportStats } from '../types/supportTypes';
import { loadKpiTargets } from '@/services/kpiService';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export type { SupportStats } from '../types/supportTypes';

export interface SupportDataReturn {
  isLoading: boolean;
  stats: SupportStats;
  kpis: KPI[];
}

export const useSupportData = (): SupportDataReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SupportStats>({
    totalSales: 0,
    totalSpent: 0,
    profit: 0,
    profitMargin: 0,
    topProducts: [],
    topClients: [],
    topSuppliers: [],
    lowStockProducts: [],
    pendingOrders: 0,
    completedOrders: 0,
    clientsCount: 0,
    suppliersCount: 0,
    categoriesCount: 0,
    productsCount: 0,
    monthlySales: [],
    monthlyData: [],
    monthlyOrders: [],
    numberOfExpenses: 0
  });
  
  const [kpis, setKpis] = useState<KPI[]>([]);
  
  // Usar React Query para cache automático do fetchSupportStats
  const { data: supportStats, isLoading: queryLoading } = useQuery({
    queryKey: ['supportStats'],
    queryFn: fetchSupportStats,
    staleTime: 1000 * 60 * 5, // cache por 5 minutos
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!queryLoading && supportStats) {
      // Só atualiza se houver stats novos
      let sStats = supportStats;
      // ... existing fallback para monthlyData/monthlySales ...
      if (!sStats.monthlyData || sStats.monthlyData.length < 2) {
        if (!sStats.monthlyData) sStats.monthlyData = [];
        if (sStats.monthlyData.length === 0) {
          sStats.monthlyData.push({
            name: 'Previous',
            vendas: sStats.totalSales * 0.9,
            compras: sStats.totalSpent * 0.9
          });
        }
        if (sStats.monthlyData.length === 1) {
          sStats.monthlyData.push({
            name: 'Current',
            vendas: sStats.totalSales,
            compras: sStats.totalSpent
          });
        }
      }
      if (!sStats.monthlySales || sStats.monthlySales.length < 2) {
        if (!sStats.monthlySales) sStats.monthlySales = [];
        if (sStats.monthlySales.length === 0) {
          sStats.monthlySales.push(sStats.totalSales * 0.9);
        }
        if (sStats.monthlySales.length === 1) {
          sStats.monthlySales.push(sStats.totalSales);
        }
      }
      setStats(sStats);

      // KPIs dependem dos stats atualizados
      (async () => {
        const calculatedKpis = generateKPIs(sStats);
        const savedTargets = await loadKpiTargets();
        if (Object.keys(savedTargets).length > 0) {
          const updatedKpis = calculatedKpis.map(kpi => ({
            ...kpi,
            target: savedTargets[kpi.name] !== undefined ? savedTargets[kpi.name] : kpi.target,
            belowTarget: kpi.isInverseKPI
              ? kpi.value > (savedTargets[kpi.name] ?? kpi.target)
              : kpi.value < (savedTargets[kpi.name] ?? kpi.target)
          }));
          setKpis(updatedKpis);
        } else {
          setKpis(calculatedKpis);
        }
      })();
    }
    setIsLoading(queryLoading);
  }, [queryLoading, supportStats]);

  // Set up realtime subscriptions for automatic updates
  useEffect(() => {
    const channels = [
      // Listen for changes in stock entries (purchases)
      supabase
        .channel('stock-entries-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stock_entries'
          },
          () => {
            console.log('Stock entries changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in stock entry items
      supabase
        .channel('stock-entry-items-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stock_entry_items'
          },
          () => {
            console.log('Stock entry items changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in stock exits (sales)
      supabase
        .channel('stock-exits-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stock_exits'
          },
          () => {
            console.log('Stock exits changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in stock exit items
      supabase
        .channel('stock-exit-items-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stock_exit_items'
          },
          () => {
            console.log('Stock exit items changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in orders
      supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          () => {
            console.log('Orders changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in order items
      supabase
        .channel('order-items-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_items'
          },
          () => {
            console.log('Order items changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in clients
      supabase
        .channel('clients-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients'
          },
          () => {
            console.log('Clients changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in suppliers
      supabase
        .channel('suppliers-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'suppliers'
          },
          () => {
            console.log('Suppliers changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe(),

      // Listen for changes in products
      supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          () => {
            console.log('Products changed, reloading KPI data...');
            loadData();
          }
        )
        .subscribe()
    ];

    return () => {
      // Cleanup subscriptions
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return {
    isLoading,
    stats,
    kpis
  };
};
