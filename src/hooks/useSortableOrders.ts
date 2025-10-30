import { useMemo } from 'react';
import { useSortableTable } from './useSortableTable';
import { Order } from '@/types';
import { useOrdersQuery } from './queries/useOrders';

export const useSortableOrders = () => {
  const { orders: rawOrders, isLoading } = useOrdersQuery();
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'date',
    direction: 'desc'
  });

  const orders = useMemo(() => {
    let sortedOrders = [...rawOrders];
    
    const order = getSupabaseOrder();
    if (order) {
      sortedOrders.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (order.column) {
          case 'number':
            aValue = a.number || '';
            bValue = b.number || '';
            break;
          case 'clientName':
            aValue = a.clientName || '';
            bValue = b.clientName || '';
            break;
          case 'date':
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case 'discount':
            aValue = a.discount || 0;
            bValue = b.discount || 0;
            break;
          default:
            return 0;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
          return order.ascending ? comparison : -comparison;
        } else {
          const diff = aValue - bValue;
          return order.ascending ? diff : -diff;
        }
      });
    } else {
      // Default sorting by date desc
      sortedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    return sortedOrders;
  }, [rawOrders, sortState]);

  return {
    orders,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};