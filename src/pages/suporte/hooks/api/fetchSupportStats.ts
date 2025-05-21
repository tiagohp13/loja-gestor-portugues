
import { SupportStats } from '../../types/supportTypes';
import { getDashboardData } from '../../../../data/mockData';
import { supabase, countPendingOrders } from '@/integrations/supabase/client';

export const fetchSupportStats = async (): Promise<SupportStats> => {
  // Get mockup data for now
  const data = getDashboardData();
  
  // Using supabase to fetch real stats (actual DB data will override mock data)
  try {
    // Get clients count
    const { count: clientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (clientsError) throw new Error(`Error fetching clients: ${clientsError.message}`);
    
    // Get suppliers count
    const { count: suppliersCount, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
      
    if (suppliersError) throw new Error(`Error fetching suppliers: ${suppliersError.message}`);
    
    // Get categories count
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (categoriesError) throw new Error(`Error fetching categories: ${categoriesError.message}`);
    
    // Get products count
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (productsError) throw new Error(`Error fetching products: ${productsError.message}`);
    
    // Get pending orders count
    const pendingOrders = await countPendingOrders();

    // Ensure data has all the required properties
    const enhancedData: SupportStats = {
      ...data,
      totalSales: data.totalSalesValue || 0,
      totalSpent: data.totalPurchaseValue || 0,
      profit: data.totalProfit || 0,
      profitMargin: data.profitMarginPercent || 0,
      clientsCount: clientsCount || 0,
      suppliersCount: suppliersCount || 0,
      categoriesCount: categoriesCount || 0,
      productsCount: productsCount || 0,
      pendingOrders,
      monthlyData: data.monthlyData || [],
      topProducts: (data.topProducts || []).map(p => ({
        id: p.id,
        name: p.name,
        sales: p.sales || 0,
        profit: p.profit || 0
      })),
      topClients: (data.topClients || []).map(c => ({
        id: c.id,
        name: c.name,
        spent: c.spent || 0,
        orders: c.orders || 0
      })),
      topSuppliers: (data.topSuppliers || []).map(s => ({
        id: s.id,
        name: s.name,
        spent: s.spent || 0,
        purchases: s.purchases || 0,
        entries: s.entries || 0
      })),
      lowStockProducts: data.lowStockProducts || [],
      monthlyOrders: (data.monthlyOrders || []).map(m => ({
        month: m.month,
        count: m.count || 0,
        completedExits: m.completedExits || 0
      }))
    };
        
    return enhancedData;
  } catch (error) {
    console.error('Error fetching support stats:', error);
    // If there's an error, return mock data as fallback with the proper structure
    return {
      totalSales: data.totalSalesValue || 0,
      totalSpent: data.totalPurchaseValue || 0,
      profit: data.totalProfit || 0,
      profitMargin: data.profitMarginPercent || 0,
      clientsCount: data.topClients?.length || 0,
      suppliersCount: data.topSuppliers?.length || 0,
      categoriesCount: 5,
      productsCount: data.topProducts?.length || 0,
      pendingOrders: 3,
      monthlyData: data.monthlyData || [],
      topProducts: (data.topProducts || []).map(p => ({
        id: p.id || "",
        name: p.name || "",
        sales: p.sales || 0,
        profit: p.profit || 0
      })),
      topClients: (data.topClients || []).map(c => ({
        id: c.id || "",
        name: c.name || "",
        spent: c.spent || 0,
        orders: c.orders || 0
      })),
      topSuppliers: (data.topSuppliers || []).map(s => ({
        id: s.id || "",
        name: s.name || "",
        spent: s.spent || 0,
        purchases: s.purchases || 0,
        entries: s.entries || 0
      })),
      lowStockProducts: data.lowStockProducts || [],
      monthlyOrders: (data.monthlyOrders || []).map(m => ({
        month: m.month || "",
        count: m.count || 0,
        completedExits: m.completedExits || 0
      }))
    };
  }
};
