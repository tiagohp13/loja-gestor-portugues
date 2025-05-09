
import { useState, useEffect } from 'react';
import { KPI } from '@/components/statistics/KPIPanel';
import { fetchSupportStats } from './api/fetchSupportStats';
import { generateKPIs } from './utils/kpiUtils';
import { SupportStats } from '../types/supportTypes';

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
    monthlySales: [],
    monthlyData: [],
    monthlyOrders: []
  });
  
  const [kpis, setKpis] = useState<KPI[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const supportStats = await fetchSupportStats();
        setStats(supportStats);
        
        // Generate KPIs based on the stats
        const calculatedKpis = generateKPIs(supportStats);
        setKpis(calculatedKpis);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  return {
    isLoading,
    stats,
    kpis
  };
};
