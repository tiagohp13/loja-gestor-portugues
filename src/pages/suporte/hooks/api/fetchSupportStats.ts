
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
        
    // Return data with real counts (mixing mock and real data for now)
    return {
      ...data,
      clientsCount: clientsCount || 0,
      suppliersCount: suppliersCount || 0,
      categoriesCount: categoriesCount || 0,
      productsCount: productsCount || 0,
      pendingOrders
    };
  } catch (error) {
    console.error('Error fetching support stats:', error);
    // If there's an error, return mock data as fallback
    return {
      ...data,
      clientsCount: data.topClients.length,
      suppliersCount: data.topSuppliers.length,
      categoriesCount: 5,
      productsCount: data.topProducts.length,
      pendingOrders: 3
    };
  }
};
