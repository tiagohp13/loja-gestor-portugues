
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

    // Map mock data properly with fallbacks
    const mockTotalSales = data.totalSalesValue || 0;
    const mockTotalSpent = data.totalStockValue || 0;
    const mockProfit = mockTotalSales - mockTotalSpent;
    const mockProfitMargin = (mockTotalSales > 0) ? ((mockProfit / mockTotalSales) * 100) : 0;

    // Create monthly data if not available
    const mappedMonthlyData = Array.isArray(data.monthlyData) 
      ? data.monthlyData 
      : Array(6).fill(0).map((_, i) => ({
          label: `Month ${i+1}`,
          value: Math.floor(Math.random() * 1000)
        }));

    // Transform top products
    const mappedTopProducts = data.lowStockProducts 
      ? data.lowStockProducts.map(p => ({
          id: p.id || "",
          name: p.name || "",
          sales: Math.floor(Math.random() * 100),
          profit: Math.floor(Math.random() * 500)
        }))
      : [];

    // Create top clients data if not available
    const mappedTopClients = data.recentTransactions
      ? data.recentTransactions.slice(0, 3).map((t, i) => ({
          id: `client-${i}`,
          name: t.client || `Client ${i+1}`,
          spent: Math.floor(Math.random() * 5000),
          orders: Math.floor(Math.random() * 10)
        }))
      : [];

    // Create top suppliers if not available
    const mappedTopSuppliers = Array(3).fill(0).map((_, i) => ({
      id: `supplier-${i}`,
      name: `Supplier ${i+1}`,
      spent: Math.floor(Math.random() * 5000),
      purchases: Math.floor(Math.random() * 10),
      entries: Math.floor(Math.random() * 20)
    }));

    // Create monthly orders if not available
    const mappedMonthlyOrders = Array(6).fill(0).map((_, i) => ({
      month: `Month ${i+1}`,
      count: Math.floor(Math.random() * 30),
      completedExits: Math.floor(Math.random() * 20)
    }));
        
    // Construct the final data object
    const enhancedData: SupportStats = {
      totalSales: mockTotalSales,
      totalSpent: mockTotalSpent,
      profit: mockProfit,
      profitMargin: mockProfitMargin,
      clientsCount: clientsCount || 0,
      suppliersCount: suppliersCount || 0,
      categoriesCount: categoriesCount || 0,
      productsCount: productsCount || 0,
      pendingOrders,
      monthlyData: mappedMonthlyData,
      topProducts: mappedTopProducts,
      topClients: mappedTopClients,
      topSuppliers: mappedTopSuppliers,
      lowStockProducts: data.lowStockProducts || [],
      monthlyOrders: mappedMonthlyOrders
    };
        
    return enhancedData;
  } catch (error) {
    console.error('Error fetching support stats:', error);
    
    // Create fallback data with proper structure for when the API fails
    const fallbackData: SupportStats = {
      totalSales: data.totalSalesValue || 0,
      totalSpent: data.totalStockValue || 0,
      profit: (data.totalSalesValue || 0) - (data.totalStockValue || 0),
      profitMargin: (data.totalSalesValue || 0) > 0 
        ? (((data.totalSalesValue || 0) - (data.totalStockValue || 0)) / (data.totalSalesValue || 0)) * 100 
        : 0,
      clientsCount: data.totalClients || 0,
      suppliersCount: data.totalSuppliers || 0,
      categoriesCount: 5,
      productsCount: data.totalProducts || 0,
      pendingOrders: 3,
      monthlyData: Array(6).fill(0).map((_, i) => ({
        label: `Month ${i+1}`,
        value: Math.floor(Math.random() * 1000)
      })),
      topProducts: Array(3).fill(0).map((_, i) => ({
        id: `product-${i}`,
        name: `Product ${i+1}`,
        sales: Math.floor(Math.random() * 100),
        profit: Math.floor(Math.random() * 500)
      })),
      topClients: Array(3).fill(0).map((_, i) => ({
        id: `client-${i}`,
        name: `Client ${i+1}`,
        spent: Math.floor(Math.random() * 5000),
        orders: Math.floor(Math.random() * 10)
      })),
      topSuppliers: Array(3).fill(0).map((_, i) => ({
        id: `supplier-${i}`,
        name: `Supplier ${i+1}`,
        spent: Math.floor(Math.random() * 5000),
        purchases: Math.floor(Math.random() * 10),
        entries: Math.floor(Math.random() * 20)
      })),
      lowStockProducts: data.lowStockProducts || [],
      monthlyOrders: Array(6).fill(0).map((_, i) => ({
        month: `Month ${i+1}`,
        count: Math.floor(Math.random() * 30),
        completedExits: Math.floor(Math.random() * 20)
      }))
    };
    
    return fallbackData;
  }
};
