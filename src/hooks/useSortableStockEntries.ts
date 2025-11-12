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
    const { data, error } = await supabase
      .from('stock_entries')
      .select('id, number, supplier_id, supplier_name, date, invoice_number, notes, status, user_id, created_at, updated_at, deleted_at')
      .neq('status', 'deleted');

      if (error) throw error;

      if (data) {
        const formattedEntries = await Promise.all(
          data.map(async (dbEntry) => {
            // Fetch entry items
            const { data: items, error: itemsError } = await supabase
              .from('stock_entry_items')
              .select('id, entry_id, product_id, product_name, quantity, purchase_price, discount_percent, created_at, updated_at')
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