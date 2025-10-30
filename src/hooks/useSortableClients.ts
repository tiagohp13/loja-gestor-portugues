import { useMemo } from 'react';
import { useSortableTable } from './useSortableTable';
import { getClientTotalSpent, getClientLastPurchaseDate } from '@/integrations/supabase/utils/financialUtils';
import { Client } from '@/types';
import { useClientsQuery } from './queries/useClients';
import { useQuery } from '@tanstack/react-query';

export const useSortableClients = () => {
  const { clients: rawClients, isLoading: clientsLoading } = useClientsQuery();
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'name',
    direction: 'asc'
  });

  // Fetch client totals and dates
  const { data: clientsWithTotals = [], isLoading: totalsLoading } = useQuery({
    queryKey: ['clients-with-totals', rawClients],
    queryFn: async () => {
      return Promise.all(
        rawClients.map(async (client) => {
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
    },
    enabled: rawClients.length > 0,
  });

  const clients = useMemo(() => {
    let sortedClients = [...clientsWithTotals];
    
    const order = getSupabaseOrder();
    if (order) {
      sortedClients.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (order.column) {
          case 'name':
            aValue = a.name || '';
            bValue = b.name || '';
            break;
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
            break;
          case 'phone':
            aValue = a.phone || '';
            bValue = b.phone || '';
            break;
          case 'totalSpent':
            aValue = a.totalSpent || 0;
            bValue = b.totalSpent || 0;
            break;
          case 'lastPurchaseDate':
            aValue = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
            bValue = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
            break;
          default:
            return 0;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return order.ascending ? comparison : -comparison;
        } else {
          const diff = aValue - bValue;
          return order.ascending ? diff : -diff;
        }
      });
    } else {
      // Default sorting by name
      sortedClients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    return sortedClients;
  }, [clientsWithTotals, sortState]);

  return {
    clients,
    isLoading: clientsLoading || totalsLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};