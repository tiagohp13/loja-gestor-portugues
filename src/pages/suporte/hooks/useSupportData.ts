
import { useState, useEffect } from 'react';
import { KPI } from '@/components/statistics/KPIPanel';
import { fetchSupportStats } from './api/fetchSupportStats';
import { generateKPIs } from './utils/kpiUtils';
import { SupportStats } from '../types/supportTypes';
import { loadKpiTargets } from '@/services/kpiService';
import { supabase } from '@/integrations/supabase/client';
import { useClients } from '@/contexts/ClientsContext';
import { useSuppliersQuery } from '@/hooks/queries/useSuppliers';
import { useCategories } from '@/contexts/CategoriesContext';
import { useProducts } from '@/contexts/ProductsContext';

export type { SupportStats } from '../types/supportTypes';

export interface SupportDataReturn {
  isLoading: boolean;
  stats: SupportStats;
  kpis: KPI[];
}

export const useSupportData = (): SupportDataReturn => {
  const { clients } = useClients();
  const { suppliers } = useSuppliersQuery();
  const { categories } = useCategories();
  const { products } = useProducts();
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
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Primeiro carregamos as estatísticas gerais
      const supportStats = await fetchSupportStats();
      
      // Atualizar os totais com dados do contexto
      supportStats.clientsCount = clients.length;
      supportStats.suppliersCount = suppliers.length;
      supportStats.categoriesCount = categories.length;
      supportStats.productsCount = products.length;
      
      // Ensure we have the necessary monthly data for comparisons
      if (!supportStats.monthlyData || supportStats.monthlyData.length < 2) {
        // Add dummy data for comparison if we don't have enough real data
        // This is just for demonstration purposes
        if (!supportStats.monthlyData) supportStats.monthlyData = [];
        if (supportStats.monthlyData.length === 0) {
          // Add a previous month with slightly lower values
          const previousMonth = {
            name: 'Previous',
            vendas: supportStats.totalSales * 0.9,
            compras: supportStats.totalSpent * 0.9
          };
          supportStats.monthlyData.push(previousMonth);
        }
        if (supportStats.monthlyData.length === 1) {
          // Add current month
          const currentMonth = {
            name: 'Current',
            vendas: supportStats.totalSales,
            compras: supportStats.totalSpent
          };
          supportStats.monthlyData.push(currentMonth);
        }
      }
      
      // Similarly ensure we have monthlySales data
      if (!supportStats.monthlySales || supportStats.monthlySales.length < 2) {
        if (!supportStats.monthlySales) supportStats.monthlySales = [];
        if (supportStats.monthlySales.length === 0) {
          supportStats.monthlySales.push(supportStats.totalSales * 0.9);
        }
        if (supportStats.monthlySales.length === 1) {
          supportStats.monthlySales.push(supportStats.totalSales);
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
  }, [clients.length, suppliers.length, categories.length, products.length]);

  // Set up realtime subscriptions APENAS para tabelas críticas com debouncing
  useEffect(() => {
    let reloadTimeout: NodeJS.Timeout;
    
    const debouncedReload = () => {
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(() => {
        loadData();
      }, 1000); // Debounce de 1 segundo
    };

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
          debouncedReload
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
          debouncedReload
        )
        .subscribe(),

      // Listen for changes in expenses
      supabase
        .channel('expenses-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses'
          },
          debouncedReload
        )
        .subscribe()
    ];

    return () => {
      clearTimeout(reloadTimeout);
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
