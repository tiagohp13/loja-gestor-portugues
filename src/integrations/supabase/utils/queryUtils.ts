
import { supabase } from '../client';

/**
 * Count pending orders
 */
export const countPendingOrders = async (): Promise<number> => {
  try {
    // Consulta direta em vez de função RPC
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .is('converted_to_stock_exit_id', null);
    
    if (error) {
      console.error('Error counting pending orders:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Exception counting pending orders:', err);
    return 0;
  }
};

/**
 * Get products with low stock
 */
export const getLowStockProducts = async (): Promise<any[]> => {
  try {
    // Query for all products first
    const { data, error } = await supabase
      .from('products')
      .select('id, name, code, current_stock, min_stock');
    
    if (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
    
    // Filter products where current_stock < min_stock on the client side
    const lowStockProducts = data ? data.filter(product => 
      product.current_stock < product.min_stock
    ) : [];
    
    return lowStockProducts;
  } catch (err) {
    console.error('Exception fetching low stock products:', err);
    return [];
  }
};
