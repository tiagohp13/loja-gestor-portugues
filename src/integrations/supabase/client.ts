import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
import { camelToSnake, snakeToCamel } from './utils/formatUtils';
import { addToDeletedCache, filterDeletedItems } from './utils/cacheUtils';
import { getClientTotalSpent, getSupplierTotalSpent } from './utils/financialUtils';

// URL do teu projeto Supabase (nunca muda)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL não está definida!');
}

// ANON KEY (sem fallback para service_role!)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY não está definida!');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Helper function to add user_id to data for RLS compatibility
export const withUserData = async (data: any) => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Erro ao obter user:', error);
    return data;
  }

  return { ...data, user_id: user?.id };
};

// Get the current user ID for use in queries
export const getCurrentUserId = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Erro ao obter user:', error);
    return null;
  }

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
    .lt('current_stock', 5);

  if (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }

  return data || [];
};

// Get the most sold product with total quantity sold
export const getMostSoldProduct = async () => {
  try {
    const { data: topProductData, error: topProductError } = await supabase
      .from('stock_exit_items')
      .select('product_id, product_name, quantity')
      .order('quantity', { ascending: false });

    if (topProductError || !topProductData || topProductData.length === 0) {
      console.error('Error fetching top product:', topProductError);
      return { name: 'Nenhum produto vendido', quantity: 0, productId: null };
    }

    const productSales: Record<
      string,
      { name: string; quantity: number; productId: string | null }
    > = {};

    topProductData.forEach((item) => {
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

    const productsList = Object.values(productSales);
    if (productsList.length === 0) {
      return { name: 'Nenhum produto vendido', quantity: 0, productId: null };
    }

    return productsList.sort((a, b) => b.quantity - a.quantity)[0];
  } catch (error) {
    console.error('Error in getMostSoldProduct:', error);
    return { name: 'Erro ao carregar dados', quantity: 0, productId: null };
  }
};

// Add increment and decrement helper functions for direct use in update statements
export const increment = (amount: number) => {
  return (value: any) => (typeof value === 'number' ? value + amount : amount);
};

export const decrement = (amount: number) => {
  return (value: any) =>
    typeof value === 'number' ? Math.max(0, value - amount) : 0;
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
