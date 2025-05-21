
import { useState, useEffect } from 'react';
import { fetchSupportStats } from './api/fetchSupportStats';
import { SupportStats } from '../types/supportTypes';
import { useKpiCalculations } from './useKpiCalculations';
import type { KPI } from '@/components/statistics/KPIPanel';

export const useSupportData = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SupportStats>({
    totalSales: 0,
    totalSpent: 0,
    profit: 0,
    profitMargin: 0,
    clientsCount: 0,
    suppliersCount: 0,
    categoriesCount: 0,
    productsCount: 0,
    pendingOrders: 0,
    monthlyData: [],
    topProducts: [],
    topClients: [],
    topSuppliers: [],
    lowStockProducts: [],
    monthlyOrders: []
  });
  
  const calculations = useKpiCalculations(stats);
  const kpis = calculations.kpis as KPI[]; // Explicitly cast to KPI type
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSupportStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching support data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return { isLoading, stats, kpis };
};
