
import { supabase, countPendingOrders, getLowStockProducts } from '@/integrations/supabase/client';
import { calculateRoiPercent, calculateProfitMarginPercent } from '@/pages/dashboard/hooks/utils/financialUtils';
import { fetchMonthlyData, fetchMonthlyOrders } from './fetchMonthlyData';
import { SupportStats } from '../../types/supportTypes';

export const fetchSupportStats = async (): Promise<SupportStats> => {
  try {
    const { data: exitItems, error: exitError } = await supabase
      .from('stock_exit_items')
      .select('quantity, sale_price, discount_percent');
      
    let totalSales = 0;
    if (exitItems && !exitError) {
      totalSales = exitItems.reduce((sum, item) => {
        const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
        return sum + (item.quantity * item.sale_price * discountMultiplier);
      }, 0);
    }
    
    const { data: entryItems, error: entryError } = await supabase
      .from('stock_entry_items')
      .select('quantity, purchase_price, discount_percent');
      
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
    
    const topProducts = await fetchTopProducts();
    const topClients = await fetchTopClients();
    const topSuppliers = await fetchTopSuppliers();
    
    const lowStockProducts = await getLowStockProducts();
    const pendingOrders = await countPendingOrders();
    const completedCount = await fetchCompletedOrdersCount();
    const clientsCount = await fetchClientsCount();
    const suppliersCount = await fetchSuppliersCount();
    const categoriesCount = await fetchCategoriesCount();
    const monthlyData = await fetchMonthlyData();
    const monthlyOrders = await fetchMonthlyOrders();
    
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

const fetchTopProducts = async () => {
  const { data: topProductsData, error: productsError } = await supabase
    .from('stock_exit_items')
    .select('product_name, product_id, quantity')
    .order('quantity', { ascending: false })
    .limit(5);
  
  if (productsError) {
    console.error('Error fetching top products:', productsError);
    return [];
  }
  
  return topProductsData?.map((product) => ({
    name: product.product_name,
    quantity: product.quantity,
    productId: product.product_id
  })) || [];
};

const fetchTopClients = async () => {
  try {
    const { data: clients, error: clientsError } = await supabase
      .from('stock_exits')
      .select('client_name, id')
      .order('client_name');
    
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

const fetchTopSuppliers = async () => {
  try {
    const { data: suppliers, error: suppliersError } = await supabase
      .from('stock_entries')
      .select('supplier_name, id')
      .order('supplier_name');
    
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

const fetchCompletedOrdersCount = async () => {
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .not('converted_to_stock_exit_id', 'is', null);
    
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
