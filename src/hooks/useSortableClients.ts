import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { getClientTotalSpent, getClientLastPurchaseDate } from '@/integrations/supabase/utils/financialUtils';
import { mapDbClientToClient } from '@/utils/mappers';
import { Client } from '@/types';

export const useSortableClients = () => {
  const [clients, setClients] = useState<Array<Client & { totalSpent: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'name',
    direction: 'asc'
  });

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .neq('status', 'deleted');

      // Apply sorting
      const order = getSupabaseOrder();
      if (order) {
        // Map frontend column names to database column names
        const columnMap: Record<string, string> = {
          'name': 'name',
          'email': 'email',
          'phone': 'phone',
          'lastPurchaseDate': 'last_purchase_date',
          'created_at': 'created_at'
        };
        
        const dbColumn = columnMap[order.column] || order.column;
        query = query.order(dbColumn, { ascending: order.ascending });
      } else {
        // Default sorting
        query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Map database clients to frontend format and fetch total spent
        const formattedClients = data.map(mapDbClientToClient);
        
        const clientsWithTotals = await Promise.all(
          formattedClients.map(async (client) => {
            const [totalSpent, lastPurchaseDate] = await Promise.all([
              getClientTotalSpent(client.id),
              getClientLastPurchaseDate(client.id)
            ]);
            return {
              ...client,
              totalSpent,
              lastPurchaseDate
            };
          })
        );

        // If sorting by totalSpent or lastPurchaseDate that need frontend sorting
        if (order?.column === 'totalSpent') {
          clientsWithTotals.sort((a, b) => {
            const diff = a.totalSpent - b.totalSpent;
            return order.ascending ? diff : -diff;
          });
        } else if (order?.column === 'lastPurchaseDate') {
          clientsWithTotals.sort((a, b) => {
            const aDate = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
            const bDate = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
            const diff = aDate - bDate;
            return order.ascending ? diff : -diff;
          });
        }

        setClients(clientsWithTotals);
      }
    } catch (error) {
      console.error('Error fetching sorted clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [sortState]);

  return {
    clients,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};