
import { useState, useEffect } from 'react';
import { KPI } from '@/components/statistics/KPIPanel';
import { fetchSupportStats } from './api/fetchSupportStats';
import { generateKPIs } from './utils/kpiUtils';
import { SupportStats } from '../types/supportTypes';
import { loadKpiTargets } from '@/services/kpiService';
import { supabase } from '@/integrations/supabase/client';

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
    monthlyOrders: []
  });
  
  const [kpis, setKpis] = useState<KPI[]>([]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Primeiro carregamos as estatísticas gerais
      const supportStats = await fetchSupportStats();
      
      // Ensure we have the necessary monthly data for comparisons
      if (!supportStats.monthlyData || supportStats.monthlyData.length < 2) {
        // Add dummy data for comparison if we don't have enough real data
        // This is just for demonstration purposes
        if (!supportStats.monthlyData) supportStats.monthlyData = [];
        if (supportStats.monthlyData.length === 0) {
          // Add a previous month with slightly lower values
          const previousMonth = {
            month: 'Previous',
            sales: supportStats.totalSales * 0.9,
            purchases: supportStats.totalSpent * 0.9
          };
          supportStats.monthlyData.push(previousMonth);
        }
        if (supportStats.monthlyData.length === 1) {
          // Add current month
          const currentMonth = {
            month: 'Current',
            sales: supportStats.totalSales,
            purchases: supportStats.totalSpent
          };
          supportStats.monthlyData.push(currentMonth);
        }
      }
      
      // Similarly ensure we have monthlySales data
      if (!supportStats.monthlySales || supportStats.monthlySales.length < 2) {
        if (!supportStats.monthlySales) supportStats.monthlySales = [];
        if (supportStats.monthlySales.length === 0) {
          supportStats.monthlySales.push({ month: 'Previous', value: supportStats.totalSales * 0.9 });
        }
        if (supportStats.monthlySales.length === 1) {
          supportStats.monthlySales.push({ month: 'Current', value: supportStats.totalSales });
        }
      }
      
      setStats(supportStats);
      
      // Depois geramos os KPIs base
      const calculatedKpis = generateKPIs(supportStats);
      
      // Em seguida carregamos as metas personalizadas da base de dados
      const savedTargets = await loadKpiTargets();
      
      // Atualizamos os KPIs com as metas personalizadas da DB
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
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);

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
