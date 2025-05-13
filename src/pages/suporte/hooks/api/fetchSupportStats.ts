
import { supabase, countPendingOrders, getLowStockProducts } from '@/integrations/supabase/client';
import { calculateRoiPercent, calculateProfitMarginPercent } from '@/pages/dashboard/hooks/utils/financialUtils';
import { fetchMonthlyData, fetchMonthlyOrders } from './fetchMonthlyData';
import { SupportStats } from '../../types/supportTypes';

export const fetchSupportStats = async (startDate?: string, endDate?: string): Promise<SupportStats> => {
  try {
    // Build query for exit items with optional date filtering
    let exitItemsQuery = supabase
      .from('stock_exit_items')
      .select('quantity, sale_price, discount_percent, exit_id');
    
    // Add date filtering if provided
    if (startDate || endDate) {
      // First get the exit IDs that match the date range
      let exitIdsQuery = supabase.from('stock_exits').select('id');
      
      if (startDate) {
        exitIdsQuery = exitIdsQuery.gte('date', `${startDate}T00:00:00`);
      }
      
      if (endDate) {
        exitIdsQuery = exitIdsQuery.lte('date', `${endDate}T23:59:59`);
      }
      
      const { data: exitIds } = await exitIdsQuery;
      
      if (exitIds && exitIds.length > 0) {
        const exitIdValues = exitIds.map(exit => exit.id);
        exitItemsQuery = exitItemsQuery.in('exit_id', exitIdValues);
      } else {
        // No exits in the date range
        return getEmptyStats();
      }
    }
    
    const { data: exitItems, error: exitError } = await exitItemsQuery;
      
    let totalSales = 0;
    if (exitItems && !exitError) {
      totalSales = exitItems.reduce((sum, item) => {
        const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
        return sum + (item.quantity * item.sale_price * discountMultiplier);
      }, 0);
    }
    
    // Build query for entry items with optional date filtering
    let entryItemsQuery = supabase
      .from('stock_entry_items')
      .select('quantity, purchase_price, discount_percent, entry_id');
    
    // Add date filtering if provided
    if (startDate || endDate) {
      // First get the entry IDs that match the date range
      let entryIdsQuery = supabase.from('stock_entries').select('id');
      
      if (startDate) {
        entryIdsQuery = entryIdsQuery.gte('date', `${startDate}T00:00:00`);
      }
      
      if (endDate) {
        entryIdsQuery = entryIdsQuery.lte('date', `${endDate}T23:59:59`);
      }
      
      const { data: entryIds } = await entryIdsQuery;
      
      if (entryIds && entryIds.length > 0) {
        const entryIdValues = entryIds.map(entry => entry.id);
        entryItemsQuery = entryItemsQuery.in('entry_id', entryIdValues);
      }
    }
    
    const { data: entryItems, error: entryError } = await entryItemsQuery;
      
    let totalSpent = 0;
    if (entryItems && !entryError) {
      totalSpent = entryItems.reduce((sum, item) => {
        const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
        return sum + (item.quantity * item.purchase_price * discountMultiplier);
      }, 0);
    }
    
    const profit = totalSales - totalSpent;
    
    // Calculate profit margin using real data
    const profitMargin = calculateProfitMarginPercent(profit, totalSales);
    
    // Apply date filters to other data queries
    const topProducts = await fetchTopProducts(startDate, endDate);
    const topClients = await fetchTopClients(startDate, endDate);
    const topSuppliers = await fetchTopSuppliers(startDate, endDate);
    
    const lowStockProducts = await getLowStockProducts();
    
    // Use date filtering for orders counts as well
    const pendingOrders = await countPendingOrders(startDate, endDate);
    const completedCount = await fetchCompletedOrdersCount(startDate, endDate);
    
    // These counts don't need date filtering as they show current state
    const clientsCount = await fetchClientsCount();
    const suppliersCount = await fetchSuppliersCount();
    const categoriesCount = await fetchCategoriesCount();
    
    const monthlyData = await fetchMonthlyData(startDate, endDate);
    const monthlyOrders = await fetchMonthlyOrders(startDate, endDate);
    
    return {
      totalSales,
      totalSpent,
      profit,
      profitMargin,
      topProducts,
      topClients,
      topSuppliers,
      lowStockProducts,
      pendingOrders,
      completedOrders: completedCount,
      clientsCount,
      suppliersCount,
      categoriesCount,
      monthlySales: [],
      monthlyData,
      monthlyOrders
    };
  } catch (error) {
    console.error('Error fetching support stats:', error);
    throw error;
  }
};

// Helper function to return empty stats when no data is available
const getEmptyStats = (): SupportStats => {
  return {
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
  };
};

const fetchTopProducts = async (startDate?: string, endDate?: string) => {
  let query = supabase
    .from('stock_exit_items')
    .select('product_name, product_id, quantity, exit_id');
    
  // Apply date filtering if needed
  if (startDate || endDate) {
    // Get exit IDs within the date range
    let exitIdsQuery = supabase.from('stock_exits').select('id');
    
    if (startDate) {
      exitIdsQuery = exitIdsQuery.gte('date', `${startDate}T00:00:00`);
    }
    
    if (endDate) {
      exitIdsQuery = exitIdsQuery.lte('date', `${endDate}T23:59:59`);
    }
    
    const { data: exitIds } = await exitIdsQuery;
    
    if (exitIds && exitIds.length > 0) {
      const exitIdValues = exitIds.map(exit => exit.id);
      query = query.in('exit_id', exitIdValues);
    } else {
      return []; // No exits in date range
    }
  }
  
  const { data: itemsData, error: itemsError } = await query;
  
  if (itemsError || !itemsData) {
    console.error('Error fetching top products:', itemsError);
    return [];
  }
  
  // Group by product and sum quantities
  const productMap = new Map();
  
  itemsData.forEach(item => {
    const key = item.product_id;
    if (!productMap.has(key)) {
      productMap.set(key, {
        name: item.product_name,
        quantity: 0,
        productId: item.product_id
      });
    }
    
    const product = productMap.get(key);
    product.quantity += item.quantity;
  });
  
  // Convert to array and sort
  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

const fetchTopClients = async (startDate?: string, endDate?: string) => {
  try {
    let query = supabase.from('stock_exits').select('client_name, id');
    
    // Apply date filtering if needed
    if (startDate) {
      query = query.gte('date', `${startDate}T00:00:00`);
    }
    
    if (endDate) {
      query = query.lte('date', `${endDate}T23:59:59`);
    }
    
    const { data: clients, error: clientsError } = await query;
    
    if (clientsError || !clients) {
      console.error('Error fetching clients:', clientsError);
      return [];
    }
    
    const clientCounts = clients.reduce((acc: Record<string, {orders: number, ids: string[]}>, current) => {
      if (!acc[current.client_name]) {
        acc[current.client_name] = { orders: 0, ids: [] };
      }
      acc[current.client_name].orders += 1;
      acc[current.client_name].ids.push(current.id);
      return acc;
    }, {});
    
    const clientSpending: Record<string, number> = {};
    
    for (const clientName of Object.keys(clientCounts)) {
      const exitIds = clientCounts[clientName].ids;
      let totalSpent = 0;
      
      for (const exitId of exitIds) {
        const { data: items } = await supabase
          .from('stock_exit_items')
          .select('quantity, sale_price, discount_percent')
          .eq('exit_id', exitId);
          
        if (items) {
          totalSpent += items.reduce((sum, item) => {
            const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
            return sum + (item.quantity * item.sale_price * discountMultiplier);
          }, 0);
        }
      }
      
      clientSpending[clientName] = totalSpent;
    }
    
    return Object.entries(clientCounts)
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        spending: clientSpending[name] || 0
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching top clients:', error);
    return [];
  }
};

const fetchTopSuppliers = async (startDate?: string, endDate?: string) => {
  try {
    let query = supabase.from('stock_entries').select('supplier_name, id');
    
    // Apply date filtering if needed
    if (startDate) {
      query = query.gte('date', `${startDate}T00:00:00`);
    }
    
    if (endDate) {
      query = query.lte('date', `${endDate}T23:59:59`);
    }
    
    const { data: suppliers, error: suppliersError } = await query;
    
    if (suppliersError || !suppliers) {
      console.error('Error fetching suppliers:', suppliersError);
      return [];
    }
    
    const supplierCounts = suppliers.reduce((acc: Record<string, number>, current) => {
      acc[current.supplier_name] = (acc[current.supplier_name] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(supplierCounts)
      .map(([name, entries]) => ({ name, entries }))
      .sort((a, b) => b.entries - a.entries)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching top suppliers:', error);
    return [];
  }
};

const fetchCompletedOrdersCount = async (startDate?: string, endDate?: string) => {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .not('converted_to_stock_exit_id', 'is', null);
  
  // Apply date filtering if needed
  if (startDate) {
    query = query.gte('date', `${startDate}T00:00:00`);
  }
  
  if (endDate) {
    query = query.lte('date', `${endDate}T23:59:59`);
  }
  
  const { count } = await query;
    
  return count || 0;
};

const fetchClientsCount = async () => {
  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });
    
  return count || 0;
};

const fetchSuppliersCount = async () => {
  const { count } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact', head: true });
    
  return count || 0;
};

const fetchCategoriesCount = async () => {
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
    
  return count || 0;
};
