
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
import { camelToSnake, snakeToCamel } from './utils/formatUtils';
import { addToDeletedCache, filterDeletedItems } from './utils/cacheUtils';
import { getClientTotalSpent, getSupplierTotalSpent } from './utils/financialUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ptkqosrcopnsclgyrjqh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a3Fvc3Jjb3Buc2NsZ3lyanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Nzg2MzUsImV4cCI6MjA1OTU1NDYzNX0.02iDkud89OEj98hFFkOt8_QNhs_N6uqAXj4laoZi7Mk';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to add user_id to data for RLS compatibility
export const withUserData = async (data: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  return { ...data, user_id: user?.id };
};

// Get the current user ID for use in queries
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// Add functions for counting pending orders and getting low stock products
export const countPendingOrders = async () => {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .is('converted_to_stock_exit_id', null);
  
  if (error) {
    console.error('Error counting pending orders:', error);
    return 0;
  }
  
  return count || 0;
};

export const getLowStockProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .lt('current_stock', 5); // Simplified until we fix the rpc function issue
  
  if (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
  
  return data || [];
};

// Get the most sold product with total quantity sold
export const getMostSoldProduct = async () => {
  try {
    // First, get the aggregated quantities by product_id
    const { data: topProductData, error: topProductError } = await supabase
      .from('stock_exit_items')
      .select('product_id, product_name, quantity')
      .order('quantity', { ascending: false });
    
    if (topProductError || !topProductData || topProductData.length === 0) {
      console.error('Error fetching top product:', topProductError);
      return { name: 'Nenhum produto vendido', quantity: 0, productId: null };
    }
    
    // Group and sum by product
    const productSales: Record<string, { name: string, quantity: number, productId: string | null }> = {};
    
    topProductData.forEach(item => {
      if (item.product_id && item.product_name) {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = {
            name: item.product_name,
            quantity: 0,
            productId: item.product_id
          };
        }
        productSales[item.product_name].quantity += item.quantity;
      }
    });
    
    // Convert to array and find the one with highest quantity
    const productsList = Object.values(productSales);
    if (productsList.length === 0) {
      return { name: 'Nenhum produto vendido', quantity: 0, productId: null };
    }
    
    // Sort by quantity (highest first) and return the top result
    return productsList.sort((a, b) => b.quantity - a.quantity)[0];
  } catch (error) {
    console.error('Error in getMostSoldProduct:', error);
    return { name: 'Erro ao carregar dados', quantity: 0, productId: null };
  }
};

// Add increment and decrement helper functions for direct use in update statements
export const increment = (amount: number) => {
  return (value: any) => typeof value === 'number' ? value + amount : amount;
};

export const decrement = (amount: number) => {
  return (value: any) => typeof value === 'number' ? Math.max(0, value - amount) : 0;
};

// Re-export utility functions
export { 
  snakeToCamel, 
  camelToSnake,
  addToDeletedCache, 
  filterDeletedItems,
  getClientTotalSpent, 
  getSupplierTotalSpent
};
