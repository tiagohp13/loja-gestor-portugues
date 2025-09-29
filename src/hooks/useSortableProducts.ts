import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { mapDbProductToProduct } from '@/utils/mappers';
import { Product } from '@/types';
import { naturalSort } from '@/pages/produtos/hooks/useProductSort';

export const useSortableProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'code',
    direction: 'asc'
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or('status.is.null,status.neq.deleted');

      if (error) throw error;

      if (data) {
        let formattedProducts = data.map(mapDbProductToProduct);
        
        // Apply client-side sorting with natural sort for codes
        const order = getSupabaseOrder();
        if (order) {
          formattedProducts.sort((a, b) => {
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
          formattedProducts.sort((a, b) => naturalSort(a.code, b.code, 'asc'));
        }
        
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching sorted products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sortState]);

  return {
    products,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};