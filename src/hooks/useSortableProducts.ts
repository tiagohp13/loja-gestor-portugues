import { useMemo } from 'react';
import { useSortableTable } from './useSortableTable';
import { Product } from '@/types';
import { naturalSort } from '@/pages/produtos/hooks/useProductSort';
import { useProductsQuery } from './queries/useProducts';

export const useSortableProducts = () => {
  const { products: rawProducts, isLoading } = useProductsQuery();
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'code',
    direction: 'asc'
  });

  const products = useMemo(() => {
    let sortedProducts = [...rawProducts];
    
    // Apply client-side sorting with natural sort for codes
    const order = getSupabaseOrder();
    if (order) {
      sortedProducts.sort((a, b) => {
        const { column, ascending } = order;
        const direction = ascending ? 'asc' : 'desc';
        
        let aValue: any, bValue: any;
        
        // Map frontend column names to product properties
        switch (column) {
          case 'code':
            return naturalSort(a.code, b.code, direction);
          case 'name':
            return naturalSort(a.name, b.name, direction);
          case 'category':
            aValue = a.category || '';
            bValue = b.category || '';
            break;
          case 'currentStock':
            aValue = a.currentStock;
            bValue = b.currentStock;
            break;
          case 'minStock':
            aValue = a.minStock;
            bValue = b.minStock;
            break;
          case 'salePrice':
            aValue = a.salePrice;
            bValue = b.salePrice;
            break;
          case 'purchasePrice':
            aValue = a.purchasePrice;
            bValue = b.purchasePrice;
            break;
          default:
            return 0;
        }
        
        // Handle non-string comparisons
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return naturalSort(aValue, bValue, direction);
        } else {
          if (direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        }
      });
    } else {
      // Default sorting by code (natural sort)
      sortedProducts.sort((a, b) => naturalSort(a.code, b.code, 'asc'));
    }
    
    return sortedProducts;
  }, [rawProducts, sortState]);

  return {
    products,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};