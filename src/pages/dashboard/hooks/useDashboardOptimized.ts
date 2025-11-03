import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { 
  mapProduct, 
  mapOrder, 
  mapStockExit, 
  mapStockEntry, 
  mapClient, 
  mapSupplier, 
  mapCategory 
} from '@/hooks/queries/mappers';
import type { StockExit, StockEntry, Product, Order } from '@/types';

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

// Fetch ALL dashboard data in parallel from Supabase directly
export const fetchAllDashboardData = async () => {
  // Fetch all data from Supabase in parallel - single round trip
  const [
    productsRes,
    ordersRes,
    stockExitsRes,
    stockEntriesRes,
    clientsRes,
    suppliersRes,
    categoriesRes,
    supportStats,
    savedTargets,
    monthlyExpenses
  ] = await Promise.all([
    supabase.from('products').select('*').eq('status', 'active').order('name'),
    supabase.from('orders').select('*, items:order_items(*)').is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('stock_exits').select('*, items:stock_exit_items(*)').eq('status', 'active').order('date', { ascending: false }),
    supabase.from('stock_entries').select('*, items:stock_entry_items(*)').eq('status', 'active').order('date', { ascending: false }),
    supabase.from('clients').select('*').eq('status', 'active').order('name'),
    supabase.from('suppliers').select('*').eq('status', 'active').order('name'),
    supabase.from('categories').select('*').eq('status', 'active').order('name'),
    fetchSupportStats(),
    loadKpiTargets(),
    getMonthlyExpensesData()
  ]);

  // Check for errors
  if (productsRes.error) throw productsRes.error;
  if (ordersRes.error) throw ordersRes.error;
  if (stockExitsRes.error) throw stockExitsRes.error;
  if (stockEntriesRes.error) throw stockEntriesRes.error;
  if (clientsRes.error) throw clientsRes.error;
  if (suppliersRes.error) throw suppliersRes.error;
  if (categoriesRes.error) throw categoriesRes.error;

  // Map Supabase data to camelCase types
  const products: Product[] = (productsRes.data || []).map(mapProduct);
  const orders: Order[] = (ordersRes.data || []).map(mapOrder);
  const stockExits: StockExit[] = (stockExitsRes.data || []).map(mapStockExit);
  const stockEntries: StockEntry[] = (stockEntriesRes.data || []).map(mapStockEntry);
  const clients = (clientsRes.data || []).map(mapClient);
  const suppliers = (suppliersRes.data || []).map(mapSupplier);
  const categories = (categoriesRes.data || []).map(mapCategory);

  // Calculate financial metrics in parallel
  const [
    totalSpent,
    totalProfit,
    profitMargin,
    roiVal,
    roiPerc
  ] = await Promise.all([
    calculateTotalSpent(stockEntries),
    calculateTotalProfitWithExpenses(calculateTotalSalesValue(stockExits), stockEntries),
    calculateProfitMarginPercentWithExpenses(calculateTotalSalesValue(stockExits), stockEntries),
    calculateRoiValueWithExpenses(calculateTotalSalesValue(stockExits), stockEntries),
    calculateRoiPercentWithExpenses(calculateTotalSalesValue(stockExits), stockEntries)
  ]);

  // Update stats with fetched data
  supportStats.clientsCount = clients.length;
  supportStats.productsCount = products.length;
  supportStats.suppliersCount = suppliers.length;
  supportStats.categoriesCount = categories.length;

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

  // Find orders with insufficient stock
  const insufficientStockItems = orders.reduce((acc: any[], order) => {
    if (order.convertedToStockExitId) return acc;
    order.items?.forEach((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.currentStock < item.quantity) {
        acc.push({ product, order, item, shortfall: item.quantity - product.currentStock });
      }
    });
    return acc;
  }, []);

  // Filter pending orders (already filtered by deleted_at in query)
  const pendingOrders = orders.filter((order) => !order.convertedToStockExitId);

  return {
    products,
    orders,
    stockExits,
    stockEntries,
    clients,
    suppliers,
    categories,
    supportStats,
    kpis,
    kpiDeltas,
    monthlyData,
    lowStockProducts,
    insufficientStockItems,
    pendingOrders,
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
  // Single query that fetches ALL data in parallel from Supabase
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-optimized'],
    queryFn: fetchAllDashboardData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const defaultKpiDeltas: KpiDeltas = {
    sales: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
    spent: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
    profit: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
    margin: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 }
  };

  return {
    isLoading,
    error,
    products: data?.products || [],
    orders: data?.orders || [],
    monthlyData: data?.monthlyData || [],
    lowStockProducts: data?.lowStockProducts || [],
    kpis: data?.kpis || [],
    kpiDeltas: data?.kpiDeltas || defaultKpiDeltas,
    supportStats: data?.supportStats,
    insufficientStockItems: data?.insufficientStockItems || [],
    pendingOrders: data?.pendingOrders || [],
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
