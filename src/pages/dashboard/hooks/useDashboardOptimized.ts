import { useQuery } from '@tanstack/react-query';
import { useData } from '@/contexts/DataContext';
import { useMemo } from 'react';
import { fetchSupportStats } from '@/pages/suporte/hooks/api/fetchSupportStats';
import { generateKPIs } from '@/pages/suporte/hooks/utils/kpiUtils';
import { loadKpiTargets } from '@/services/kpiService';
import { 
  createMonthlyDataMap, 
  processExitsForMonthlyData,
  processEntriesForMonthlyData 
} from './utils/dateUtils';
import { 
  identifyLowStockProducts,
  calculateTotalStockValue
} from './utils/productUtils';
import { 
  calculateTotalSalesValue,
  calculateTotalPurchaseValue,
  calculateTotalSpent,
  calculateTotalProfitWithExpenses,
  calculateProfitMarginPercentWithExpenses,
  calculateRoiValueWithExpenses,
  calculateRoiPercentWithExpenses,
  getMonthlyExpensesData
} from './utils/financialUtils';
import type { StockExit, StockEntry } from '@/types';

interface KpiDelta {
  pct30d: number;
  pctMoM: number;
  value30d: number;
  valueMoM: number;
}

interface KpiDeltas {
  sales: KpiDelta;
  spent: KpiDelta;
  profit: KpiDelta;
  margin: KpiDelta;
}

// Helper to calculate KPI deltas
const calculateKpiDeltas = (stockExits: StockExit[], stockEntries: StockEntry[]): KpiDeltas => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  
  const filterByDate = (items: any[], startDate: Date, endDate: Date) => 
    items.filter(item => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    });
  
  const calculateTotal = (items: any[], isExit: boolean) => 
    items.reduce((sum, item) => 
      sum + item.items.reduce((itemSum: number, i: any) => 
        itemSum + (i.quantity * (isExit ? i.salePrice : i.purchasePrice)), 0
      ), 0
    );
  
  const last30DaysExits = filterByDate(stockExits, thirtyDaysAgo, now);
  const prev30DaysExits = filterByDate(stockExits, sixtyDaysAgo, thirtyDaysAgo);
  const currentMonthExits = filterByDate(stockExits, currentMonthStart, now);
  const lastMonthExits = filterByDate(stockExits, lastMonthStart, lastMonthEnd);
  
  const last30DaysEntries = filterByDate(stockEntries, thirtyDaysAgo, now);
  const prev30DaysEntries = filterByDate(stockEntries, sixtyDaysAgo, thirtyDaysAgo);
  const currentMonthEntries = filterByDate(stockEntries, currentMonthStart, now);
  const lastMonthEntries = filterByDate(stockEntries, lastMonthStart, lastMonthEnd);
  
  const sales30d = calculateTotal(last30DaysExits, true);
  const salesPrev30d = calculateTotal(prev30DaysExits, true);
  const salesMoM = calculateTotal(currentMonthExits, true);
  const salesLastMonth = calculateTotal(lastMonthExits, true);
  
  const purchases30d = calculateTotal(last30DaysEntries, false);
  const purchasesPrev30d = calculateTotal(prev30DaysEntries, false);
  const purchasesMoM = calculateTotal(currentMonthEntries, false);
  const purchasesLastMonth = calculateTotal(lastMonthEntries, false);
  
  const profit30d = sales30d - purchases30d;
  const profitPrev30d = salesPrev30d - purchasesPrev30d;
  const profitMoM = salesMoM - purchasesMoM;
  const profitLastMonth = salesLastMonth - purchasesLastMonth;
  
  const margin30d = sales30d > 0 ? (profit30d / sales30d) * 100 : 0;
  const marginPrev30d = salesPrev30d > 0 ? (profitPrev30d / salesPrev30d) * 100 : 0;
  const marginMoM = salesMoM > 0 ? (profitMoM / salesMoM) * 100 : 0;
  const marginLastMonth = salesLastMonth > 0 ? (profitLastMonth / salesLastMonth) * 100 : 0;
  
  const calcPct = (current: number, previous: number) => 
    previous > 0 ? ((current - previous) / previous) * 100 : 0;
  
  return {
    sales: {
      pct30d: calcPct(sales30d, salesPrev30d),
      pctMoM: calcPct(salesMoM, salesLastMonth),
      value30d: sales30d,
      valueMoM: salesMoM
    },
    spent: {
      pct30d: calcPct(purchases30d, purchasesPrev30d),
      pctMoM: calcPct(purchasesMoM, purchasesLastMonth),
      value30d: purchases30d,
      valueMoM: purchasesMoM
    },
    profit: {
      pct30d: calcPct(profit30d, profitPrev30d),
      pctMoM: calcPct(profitMoM, profitLastMonth),
      value30d: profit30d,
      valueMoM: profitMoM
    },
    margin: {
      pct30d: calcPct(margin30d, marginPrev30d),
      pctMoM: calcPct(marginMoM, marginLastMonth),
      value30d: margin30d,
      valueMoM: marginMoM
    }
  };
};

// Fetch all dashboard data in parallel
const fetchAllDashboardData = async (
  products: any[],
  stockExits: StockExit[],
  stockEntries: StockEntry[],
  clients: any[]
) => {
  // Execute all queries in parallel
  const [
    supportStats,
    savedTargets,
    totalSpent,
    totalProfit,
    profitMargin,
    roiVal,
    roiPerc,
    monthlyExpenses
  ] = await Promise.all([
    fetchSupportStats(),
    loadKpiTargets(),
    calculateTotalSpent(stockEntries),
    calculateTotalProfitWithExpenses(calculateTotalSalesValue(stockExits), stockEntries),
    calculateProfitMarginPercentWithExpenses(calculateTotalSalesValue(stockExits), stockEntries),
    calculateRoiValueWithExpenses(calculateTotalSalesValue(stockExits), stockEntries),
    calculateRoiPercentWithExpenses(calculateTotalSalesValue(stockExits), stockEntries),
    getMonthlyExpensesData()
  ]);

  // Update stats with context data
  supportStats.clientsCount = clients.length;
  supportStats.productsCount = products.length;

  // Generate KPIs
  const calculatedKpis = generateKPIs(supportStats);
  const kpis = Object.keys(savedTargets).length > 0
    ? calculatedKpis.map(kpi => ({
        ...kpi,
        target: savedTargets[kpi.name] !== undefined ? savedTargets[kpi.name] : kpi.target,
        belowTarget: kpi.isInverseKPI 
          ? kpi.value > (savedTargets[kpi.name] ?? kpi.target)
          : kpi.value < (savedTargets[kpi.name] ?? kpi.target)
      }))
    : calculatedKpis;

  // Calculate deltas
  const kpiDeltas = calculateKpiDeltas(stockExits, stockEntries);

  // Build monthly data
  const dataMap = createMonthlyDataMap();
  processExitsForMonthlyData(stockExits, dataMap);
  processEntriesForMonthlyData(stockEntries, dataMap);
  
  Object.entries(monthlyExpenses).forEach(([monthKey, expenseValue]) => {
    const [year, month] = monthKey.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = monthDate.toLocaleDateString('pt-PT', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (dataMap.has(monthName)) {
      dataMap.get(monthName)!.compras += expenseValue;
    }
  });
  
  const monthlyData = Array.from(dataMap.values());
  const lowStockProducts = identifyLowStockProducts(products);

  return {
    supportStats,
    kpis,
    kpiDeltas,
    monthlyData,
    lowStockProducts,
    totalSalesValue: calculateTotalSalesValue(stockExits),
    totalPurchaseValue: calculateTotalPurchaseValue(stockEntries),
    totalStockValue: calculateTotalStockValue(products),
    totalSpentWithExpenses: totalSpent,
    totalProfitWithExpenses: totalProfit,
    profitMarginPercentWithExpenses: profitMargin,
    roiValueWithExpenses: roiVal,
    roiPercentWithExpenses: roiPerc
  };
};

export const useDashboardOptimized = () => {
  const { products, orders, stockExits, stockEntries, clients, suppliers, categories } = useData();

  // Single query that fetches all data in parallel with React Query for caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-all-data', products.length, orders.length, stockExits.length, stockEntries.length, clients.length],
    queryFn: () => fetchAllDashboardData(products, stockExits, stockEntries, clients),
    staleTime: 10 * 60 * 1000, // 10 minutes - dashboard data doesn't need frequent updates
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  // Memoize derived data
  const derivedData = useMemo(() => {
    if (!data) return null;

    const findInsufficientStockOrders = (orders: any[], products: any[]) => {
      return orders.reduce((acc: any[], order) => {
        if (order.convertedToStockExitId || order.status === "deleted") return acc;
        order.items.forEach((item: any) => {
          const product = products.find((p) => p.id === item.productId);
          if (product && product.currentStock < item.quantity) {
            acc.push({ product, order, item, shortfall: item.quantity - product.currentStock });
          }
        });
        return acc;
      }, []);
    };

    return {
      insufficientStockItems: findInsufficientStockOrders(orders, products),
      pendingOrders: orders.filter((order) => !order.convertedToStockExitId && order.status !== "deleted"),
      updatedStats: {
        ...data.supportStats,
        totalSpent: data.totalSpentWithExpenses,
        profit: data.totalProfitWithExpenses,
        profitMargin: data.profitMarginPercentWithExpenses,
        clientsCount: clients.length,
        suppliersCount: suppliers.length,
        categoriesCount: categories.length,
        productsCount: products.length
      }
    };
  }, [data, orders, products, clients.length, suppliers.length, categories.length]);

  const defaultKpiDeltas: KpiDeltas = {
    sales: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
    spent: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
    profit: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
    margin: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 }
  };

  return {
    isLoading,
    error,
    products,
    orders,
    monthlyData: data?.monthlyData || [],
    lowStockProducts: data?.lowStockProducts || [],
    kpis: data?.kpis || [],
    kpiDeltas: data?.kpiDeltas || defaultKpiDeltas,
    supportStats: derivedData?.updatedStats || data?.supportStats,
    insufficientStockItems: derivedData?.insufficientStockItems || [],
    pendingOrders: derivedData?.pendingOrders || [],
    totalSalesValue: data?.totalSalesValue || 0,
    totalPurchaseValue: data?.totalPurchaseValue || 0,
    totalStockValue: data?.totalStockValue || 0,
    totalSpentWithExpenses: data?.totalSpentWithExpenses || 0,
    totalProfitWithExpenses: data?.totalProfitWithExpenses || 0,
    profitMarginPercentWithExpenses: data?.profitMarginPercentWithExpenses || 0,
    roiValueWithExpenses: data?.roiValueWithExpenses || 0,
    roiPercentWithExpenses: data?.roiPercentWithExpenses || 0
  };
};
