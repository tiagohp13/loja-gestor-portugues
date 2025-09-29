import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { mapDbProductToProduct } from '@/utils/mappers';
import { Product } from '@/types';

export const useSortableProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'code',
    direction: 'asc'
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .or('status.is.null,status.neq.deleted');

      // Apply sorting
      const order = getSupabaseOrder();
      if (order) {
        // Map frontend column names to database column names
        const columnMap: Record<string, string> = {
          'name': 'name',
          'code': 'code',
          'category': 'category',
          'currentStock': 'current_stock',
          'minStock': 'min_stock',
          'salePrice': 'sale_price',
          'purchasePrice': 'purchase_price',
          'created_at': 'created_at'
        };
        
        const dbColumn = columnMap[order.column] || order.column;
        query = query.order(dbColumn, { ascending: order.ascending });
      } else {
        // Default sorting by code
        query = query.order('code', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedProducts = data.map(mapDbProductToProduct);
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching sorted products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sortState]);

  return {
    products,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};