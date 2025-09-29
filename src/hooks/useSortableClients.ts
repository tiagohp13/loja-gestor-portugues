import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { getClientTotalSpent } from '@/integrations/supabase/client';
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
            const totalSpent = await getClientTotalSpent(client.id);
            return {
              ...client,
              totalSpent
            };
          })
        );

        // If sorting by totalSpent, we need to sort on the frontend since it's calculated
        if (order?.column === 'totalSpent') {
          clientsWithTotals.sort((a, b) => {
            const diff = a.totalSpent - b.totalSpent;
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