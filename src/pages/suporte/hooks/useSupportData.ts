
import { useState, useEffect } from 'react';
import { KPI } from '@/components/statistics/KPIPanel';
import { fetchSupportStats } from './api/fetchSupportStats';
import { generateKPIs } from './utils/kpiUtils';
import { SupportStats } from '../types/supportTypes';
import { useKpiCalculations } from './useKpiCalculations';

export type { SupportStats } from '../types/supportTypes';

export interface MonthlyKpiData {
  month: Date;
  value: number;
}

export interface SupportDataReturn {
  isLoading: boolean;
  stats: SupportStats;
  kpis: KPI[];
  kpiMonthlyData: {
    roi: MonthlyKpiData[];
    margemLucro: MonthlyKpiData[];
    taxaConversao: MonthlyKpiData[];
    valorMedioCompra: MonthlyKpiData[];
    valorMedioVenda: MonthlyKpiData[];
    lucroMedioVenda: MonthlyKpiData[];
    lucroTotal: MonthlyKpiData[];
    lucroPorCliente: MonthlyKpiData[];
  };
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
  const [kpiMonthlyData, setKpiMonthlyData] = useState<SupportDataReturn['kpiMonthlyData']>({
    roi: [],
    margemLucro: [],
    taxaConversao: [],
    valorMedioCompra: [],
    valorMedioVenda: [],
    lucroMedioVenda: [],
    lucroTotal: [],
    lucroPorCliente: []
  });
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const supportStats = await fetchSupportStats();
        setStats(supportStats);
        
        // Generate KPIs based on the stats
        const calculatedKpis = generateKPIs(supportStats);
        setKpis(calculatedKpis);
        
        // Generate monthly KPI data
        generateMonthlyKpiData(supportStats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Function to generate monthly KPI data from the monthly stats
  const generateMonthlyKpiData = (supportStats: SupportStats) => {
    const { monthlyData } = supportStats;
    
    // Create arrays for each KPI
    const roiData: MonthlyKpiData[] = [];
    const margemLucroData: MonthlyKpiData[] = [];
    const taxaConversaoData: MonthlyKpiData[] = [];
    const valorMedioCompraData: MonthlyKpiData[] = [];
    const valorMedioVendaData: MonthlyKpiData[] = [];
    const lucroMedioVendaData: MonthlyKpiData[] = [];
    const lucroTotalData: MonthlyKpiData[] = [];
    const lucroPorClienteData: MonthlyKpiData[] = [];
    
    // Process each month's data
    monthlyData.forEach(month => {
      const date = new Date(month.month);
      
      // ROI = (Profit / Purchases) * 100
      const roi = month.purchases > 0 ? (month.profit / month.purchases) * 100 : 0;
      
      // Profit Margin = (Profit / Sales) * 100
      const profitMargin = month.sales > 0 ? (month.profit / month.sales) * 100 : 0;
      
      // Conversion Rate - Use the clientTransactions if available, otherwise use a default calculation
      // For demonstration, we're using a ratio of completed orders to 2x the number of days in the month
      // This is a placeholder and should be replaced with actual client transaction data
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const estimatedClientsInMonth = daysInMonth * 2; // Rough estimate
      const taxaConversao = estimatedClientsInMonth > 0 ? 
        (month.completedOrders / estimatedClientsInMonth) * 100 : 0;
      
      // Average Purchase Value
      const averagePurchaseValue = month.entriesCount > 0 ? 
        month.purchases / month.entriesCount : 0;
      
      // Average Sale Value
      const averageSaleValue = month.completedOrders > 0 ? 
        month.sales / month.completedOrders : 0;
      
      // Average Profit per Sale
      const averageProfitPerSale = month.completedOrders > 0 ? 
        month.profit / month.completedOrders : 0;
      
      // Total Profit (already calculated)
      const totalProfit = month.profit;
      
      // Profit per Client 
      const profitPerClient = estimatedClientsInMonth > 0 ? 
        month.profit / estimatedClientsInMonth : 0;
      
      // Add the data points to their respective arrays
      roiData.push({ month: date, value: roi });
      margemLucroData.push({ month: date, value: profitMargin });
      taxaConversaoData.push({ month: date, value: taxaConversao });
      valorMedioCompraData.push({ month: date, value: averagePurchaseValue });
      valorMedioVendaData.push({ month: date, value: averageSaleValue });
      lucroMedioVendaData.push({ month: date, value: averageProfitPerSale });
      lucroTotalData.push({ month: date, value: totalProfit });
      lucroPorClienteData.push({ month: date, value: profitPerClient });
    });
    
    // Set the monthly KPI data
    setKpiMonthlyData({
      roi: roiData,
      margemLucro: margemLucroData,
      taxaConversao: taxaConversaoData,
      valorMedioCompra: valorMedioCompraData,
      valorMedioVenda: valorMedioVendaData,
      lucroMedioVenda: lucroMedioVendaData,
      lucroTotal: lucroTotalData,
      lucroPorCliente: lucroPorClienteData
    });
  };

  return {
    isLoading,
    stats,
    kpis,
    kpiMonthlyData
  };
};
