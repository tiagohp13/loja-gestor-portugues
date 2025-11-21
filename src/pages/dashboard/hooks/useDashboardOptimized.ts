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

// Fetch dashboard data with optimizations (limits + edge function for heavy calculations)
export const fetchAllDashboardData = async () => {
  try {
    // Fetch data with limits for better performance
    const [
      productsRes,
      ordersRes,
      clientsRes,
      suppliersRes,
      categoriesRes,
      supportStats,
      savedTargets,
      metricsRes
    ] = await Promise.all([
      supabase.from('products').select('id, code, name, description, category, purchase_price, sale_price, current_stock, min_stock, image, status, user_id, created_at, updated_at').eq('status', 'active').order('name').limit(1000),
      supabase.from('orders').select('id, number, client_id, client_name, date, order_type, delivery_location, expected_delivery_date, expected_delivery_time, notes, total_amount, discount, converted_to_stock_exit_id, converted_to_stock_exit_number, status, user_id, created_at, updated_at, items:order_items(id, order_id, product_id, product_name, quantity, sale_price, discount_percent, created_at, updated_at)').is('deleted_at', null).neq('status', 'cancelled').order('created_at', { ascending: false }).limit(200),
      supabase.from('clients').select('id, name, email, phone, address, tax_id, notes, status, last_purchase_date, user_id, created_at, updated_at').eq('status', 'active').order('name').limit(500),
      supabase.from('suppliers').select('id, name, email, phone, address, tax_id, payment_terms, notes, status, user_id, created_at, updated_at').eq('status', 'active').order('name').limit(500),
      supabase.from('categories').select('id, name, description, status, product_count, user_id, created_at, updated_at').eq('status', 'active').order('name').limit(100),
      fetchSupportStats(),
      loadKpiTargets(),
      (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return supabase.functions.invoke('dashboard-metrics', {
          headers: session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`
          } : {}
        });
      })()
    ]);

    // Check for errors
    const errors: string[] = [];
    if (productsRes.error) errors.push(`Produtos: ${productsRes.error.message}`);
    if (ordersRes.error) errors.push(`Encomendas: ${ordersRes.error.message}`);
    if (clientsRes.error) errors.push(`Clientes: ${clientsRes.error.message}`);
    if (suppliersRes.error) errors.push(`Fornecedores: ${suppliersRes.error.message}`);
    if (categoriesRes.error) errors.push(`Categorias: ${categoriesRes.error.message}`);
    if (metricsRes.error) errors.push(`Métricas: ${metricsRes.error.message}`);

    // Map data
    const products: Product[] = (productsRes.data || []).map(mapProduct);
    const orders: Order[] = (ordersRes.data || []).map(mapOrder);
    const clients = (clientsRes.data || []).map(mapClient);
    const suppliers = (suppliersRes.data || []).map(mapSupplier);
    const categories = (categoriesRes.data || []).map(mapCategory);

    // Get metrics from edge function
    const metrics = metricsRes.data || {
      kpiDeltas: {
        sales: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
        spent: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
        profit: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
        margin: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 }
      },
      totals: { totalSales: 0, totalSpent: 0, totalProfit: 0, profitMargin: 0 },
      monthlyData: []
    };

    // Update stats
    supportStats.clientsCount = clients.length;
    supportStats.productsCount = products.length;
    supportStats.suppliersCount = suppliers.length;
    supportStats.categoriesCount = categories.length;
    supportStats.totalSales = metrics.totals.totalSales;
    supportStats.totalSpent = metrics.totals.totalSpent;
    supportStats.profit = metrics.totals.totalProfit;
    supportStats.profitMargin = metrics.totals.profitMargin;

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

    const lowStockProducts = identifyLowStockProducts(products);

    // Find orders with insufficient stock (exclude cancelled and already converted orders)
    const insufficientStockItems = orders.reduce((acc: any[], order) => {
      if (order.convertedToStockExitId || order.status === 'cancelled') return acc;
      order.items?.forEach((item: any) => {
        const product = products.find((p) => p.id === item.productId);
        if (product && product.currentStock < item.quantity) {
          acc.push({ product, order, item, shortfall: item.quantity - product.currentStock });
        }
      });
      return acc;
    }, []);

    // Filter pending orders (exclude cancelled and already converted orders - deleted_at already filtered in query)
    const pendingOrders = orders.filter((order) => 
      !order.convertedToStockExitId && 
      order.status !== 'cancelled'
    );

    return {
      products,
      orders,
      clients,
      suppliers,
      categories,
      supportStats,
      kpis,
      kpiDeltas: metrics.kpiDeltas,
      monthlyData: metrics.monthlyData,
      lowStockProducts,
      insufficientStockItems,
      pendingOrders,
      totalSalesValue: metrics.totals.totalSales,
      totalStockValue: calculateTotalStockValue(products),
      totalSpentWithExpenses: metrics.totals.totalSpent,
      totalProfitWithExpenses: metrics.totals.totalProfit,
      profitMarginPercentWithExpenses: metrics.totals.profitMargin,
      errors
    };
  } catch (error) {
    console.error("Critical error in fetchAllDashboardData:", error);
    return {
      errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
      products: [],
      orders: [],
      stockExits: [],
      stockEntries: [],
      clients: [],
      suppliers: [],
      categories: [],
      supportStats: {
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
        productsCount: 0,
        suppliersCount: 0,
        categoriesCount: 0,
        monthlySales: [],
        monthlyData: [],
        monthlyOrders: [],
        numberOfExpenses: 0
      },
      kpis: [],
      kpiDeltas: {
        sales: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
        spent: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
        profit: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 },
        margin: { pct30d: 0, pctMoM: 0, value30d: 0, valueMoM: 0 }
      },
      monthlyData: [],
      lowStockProducts: [],
      insufficientStockItems: [],
      pendingOrders: [],
      totalSalesValue: 0,
      totalStockValue: 0,
      totalSpentWithExpenses: 0,
      totalProfitWithExpenses: 0,
      profitMarginPercentWithExpenses: 0
    };
  }
};

export const useDashboardOptimized = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-optimized'],
    queryFn: () => fetchAllDashboardData(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true
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
    refetch,
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
    totalStockValue: data?.totalStockValue || 0,
    totalSpentWithExpenses: data?.totalSpentWithExpenses || 0,
    totalProfitWithExpenses: data?.totalProfitWithExpenses || 0,
    profitMarginPercentWithExpenses: data?.profitMarginPercentWithExpenses || 0,
    errors: data?.errors || []
  };
};
