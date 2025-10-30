import { useMemo } from 'react';
import { useSortableTable } from './useSortableTable';
import { Supplier } from '@/types';
import { useSuppliersQuery } from './queries/useSuppliers';

export const useSortableSuppliers = () => {
  const { suppliers: rawSuppliers, isLoading } = useSuppliersQuery();
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'name',
    direction: 'asc'
  });

  const suppliers = useMemo(() => {
    let sortedSuppliers = [...rawSuppliers];
    
    const order = getSupabaseOrder();
    if (order) {
      sortedSuppliers.sort((a, b) => {
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
          case 'address':
            aValue = a.address || '';
            bValue = b.address || '';
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
      sortedSuppliers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    return sortedSuppliers;
  }, [rawSuppliers, sortState]);

  return {
    suppliers,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};