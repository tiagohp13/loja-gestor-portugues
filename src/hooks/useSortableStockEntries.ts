import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { mapDbStockEntryToStockEntry } from '@/utils/mappers';
import { StockEntry } from '@/types';

export const useSortableStockEntries = () => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'date',
    direction: 'desc'
  });

  const fetchStockEntries = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('stock_entries')
        .select('*')
        .neq('status', 'deleted');

      // Apply sorting
      const order = getSupabaseOrder();
      if (order) {
        // Map frontend column names to database column names
        const columnMap: Record<string, string> = {
          'number': 'number',
          'supplierName': 'supplier_name',
          'date': 'date',
          'invoiceNumber': 'invoice_number',
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
        const formattedEntries = await Promise.all(
          data.map(async (dbEntry) => {
            // Fetch entry items
            const { data: items, error: itemsError } = await supabase
              .from('stock_entry_items')
              .select('*')
              .eq('entry_id', dbEntry.id);

            if (itemsError) {
              console.error('Error fetching entry items:', itemsError);
              return { ...mapDbStockEntryToStockEntry(dbEntry), items: [] };
            }

            // Map items to frontend format
            const mappedItems = (items || []).map(item => ({
              id: item.id,
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity,
              purchasePrice: item.purchase_price,
              discountPercent: item.discount_percent,
              createdAt: item.created_at,
              updatedAt: item.updated_at
            }));

            return {
              ...mapDbStockEntryToStockEntry(dbEntry),
              items: mappedItems
            };
          })
        );
        
        setStockEntries(formattedEntries);
      }
    } catch (error) {
      console.error('Error fetching sorted stock entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockEntries();
  }, [sortState]);

  return {
    stockEntries,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};