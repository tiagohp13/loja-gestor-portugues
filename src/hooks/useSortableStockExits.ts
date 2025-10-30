import { useMemo } from 'react';
import { useSortableTable } from './useSortableTable';
import { StockExit } from '@/types';
import { useStockExitsQuery } from './queries/useStockExits';

export const useSortableStockExits = () => {
  const { stockExits: rawStockExits, isLoading } = useStockExitsQuery();
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'date',
    direction: 'desc'
  });

  const stockExits = useMemo(() => {
    let sortedExits = [...rawStockExits];
    
    const order = getSupabaseOrder();
    if (order) {
      sortedExits.sort((a, b) => {
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
          case 'invoiceNumber':
            aValue = a.invoiceNumber || '';
            bValue = b.invoiceNumber || '';
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
      sortedExits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    return sortedExits;
  }, [rawStockExits, sortState]);

  return {
    stockExits,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};