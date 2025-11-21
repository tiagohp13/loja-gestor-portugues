import { useMemo } from 'react';
import { useSortableTable } from './useSortableTable';
import { useClientsQuery } from './queries/useClients';

export const useSortableClients = () => {
  const { clients: rawClients, isLoading } = useClientsQuery();
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'name',
    direction: 'asc'
  });

  const clients = useMemo(() => {
    let sortedClients = [...rawClients];
    
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
  }, [rawClients, sortState]);

  return {
    clients,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};