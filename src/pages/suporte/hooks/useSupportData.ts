
import { useState, useEffect } from 'react';
import { KPI } from '@/components/statistics/KPIPanel';
import { fetchSupportStats } from './api/fetchSupportStats';
import { generateKPIs } from './utils/kpiUtils';
import { SupportStats } from '../types/supportTypes';
import { TimeFilterPeriod } from '@/components/statistics/TimeFilter';
import { supabase } from '@/integrations/supabase/client';

export type { SupportStats } from '../types/supportTypes';

export interface SupportDataReturn {
  isLoading: boolean;
  stats: SupportStats;
  kpis: KPI[];
  availableYears: number[];
  filterDataByTimePeriod: (period: TimeFilterPeriod, year?: number, month?: number) => void;
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
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  // Original data storage for filtering
  const [entriesData, setEntriesData] = useState<any[]>([]);
  const [exitsData, setExitsData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const supportStats = await fetchSupportStats();
        setStats(supportStats);
        
        // Generate KPIs based on the stats
        const calculatedKpis = generateKPIs(supportStats);
        setKpis(calculatedKpis);
        
        // Load transaction data for filtering
        await loadTransactionData();
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Load transaction data for time filtering
  const loadTransactionData = async () => {
    try {
      // Fetch entries data
      const { data: entries } = await supabase
        .from('stock_entries')
        .select('id, date');
        
      if (entries) {
        setEntriesData(entries);
      }
      
      // Fetch exits data  
      const { data: exits } = await supabase
        .from('stock_exits')
        .select('id, date');
        
      if (exits) {
        setExitsData(exits);
      }
      
      // Calculate available years
      const years = new Set<number>();
      
      [...(entries || []), ...(exits || [])].forEach(item => {
        if (item.date) {
          const date = new Date(item.date);
          years.add(date.getFullYear());
        }
      });
      
      setAvailableYears(Array.from(years).sort((a, b) => b - a)); // Sort descending
      
    } catch (error) {
      console.error('Error loading transaction data for filtering:', error);
    }
  };
  
  // Filter data by time period
  const filterDataByTimePeriod = async (period: TimeFilterPeriod, year?: number, month?: number) => {
    setIsLoading(true);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      if (period === 'year' && year) {
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      } else if (period === 'month' && year && month) {
        // Create date for first day of selected month
        const firstDay = new Date(year, month - 1, 1);
        // Create date for last day of selected month
        const lastDay = new Date(year, month, 0);
        
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
      }
      
      // If all-time is selected or no valid date range is provided, fetch all data
      const supportStats = await fetchSupportStats(startDate, endDate);
      setStats(supportStats);
      
      // Generate KPIs based on the filtered stats
      const calculatedKpis = generateKPIs(supportStats);
      setKpis(calculatedKpis);
    } catch (error) {
      console.error('Error filtering data by time period:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    stats,
    kpis,
    availableYears,
    filterDataByTimePeriod
  };
};
