import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { mapDbStockExitToStockExit } from '@/utils/mappers';
import { StockExit } from '@/types';

export const useSortableStockExits = () => {
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'date',
    direction: 'desc'
  });

  const fetchStockExits = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('stock_exits')
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
          'invoiceNumber': 'invoice_number',
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
        const formattedExits = await Promise.all(
          data.map(async (dbExit) => {
            // Fetch exit items
            const { data: items, error: itemsError } = await supabase
              .from('stock_exit_items')
              .select('*')
              .eq('exit_id', dbExit.id);

            if (itemsError) {
              console.error('Error fetching exit items:', itemsError);
              return { ...mapDbStockExitToStockExit(dbExit), items: [] };
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
              ...mapDbStockExitToStockExit(dbExit),
              items: mappedItems
            };
          })
        );
        
        setStockExits(formattedExits);
      }
    } catch (error) {
      console.error('Error fetching sorted stock exits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockExits();
  }, [sortState]);

  return {
    stockExits,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};