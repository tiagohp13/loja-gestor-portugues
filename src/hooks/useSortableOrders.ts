import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { mapDbOrderToOrder } from '@/utils/mappers';
import { Order } from '@/types';

export const useSortableOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'date',
    direction: 'desc'
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .neq('status', 'deleted');

      // Apply sorting
      const order = getSupabaseOrder();
      if (order) {
        // Map frontend column names to database column names
        const columnMap: Record<string, string> = {
          'number': 'number',
          'clientName': 'client_name',
          'date': 'date',
          'discount': 'discount',
          'created_at': 'created_at'
        };
        
        const dbColumn = columnMap[order.column] || order.column;
        query = query.order(dbColumn, { ascending: order.ascending });
      } else {
        // Default sorting
        query = query.order('date', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedOrders = await Promise.all(
          data.map(async (dbOrder) => {
            // Fetch order items
            const { data: items, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', dbOrder.id);

            if (itemsError) {
              console.error('Error fetching order items:', itemsError);
              return { ...mapDbOrderToOrder(dbOrder), items: [] };
            }

            // Map items to frontend format
            const mappedItems = (items || []).map(item => ({
              id: item.id,
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity,
              salePrice: item.sale_price,
              discountPercent: item.discount_percent,
              createdAt: item.created_at,
              updatedAt: item.updated_at
            }));

            return {
              ...mapDbOrderToOrder(dbOrder),
              items: mappedItems
            };
          })
        );
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching sorted orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sortState]);

  return {
    orders,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};