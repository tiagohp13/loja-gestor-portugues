
import { useState, useEffect } from 'react';
import { KPI } from '@/components/statistics/KPIPanel';
import { fetchSupportStats } from './api/fetchSupportStats';
import { generateKPIs } from './utils/kpiUtils';
import { SupportStats } from '../types/supportTypes';
import { loadKpiTargets } from '@/services/kpiService';

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
    productsCount: 0,  // Added the productsCount property here
    monthlySales: [],
    monthlyData: [],
    monthlyOrders: []
  });
  
  const [kpis, setKpis] = useState<KPI[]>([]);
  
  useEffect(() => {
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
    
    loadData();
  }, []);

  return {
    isLoading,
    stats,
    kpis
  };
};
