
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
import { camelToSnake, snakeToCamel } from './utils/formatUtils';
import { addToDeletedCache, filterDeletedItems } from './utils/cacheUtils';
import { getClientTotalSpent, getSupplierTotalSpent } from './utils/financialUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
    .lt('current_stock', supabase.rpc('greatest', { a: 'min_stock', b: 5 }));
  
  if (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
  
  return data || [];
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
