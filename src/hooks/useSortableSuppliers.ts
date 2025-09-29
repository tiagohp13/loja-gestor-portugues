import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSortableTable } from './useSortableTable';
import { mapDbSupplierToSupplier } from '@/utils/mappers';
import { Supplier } from '@/types';

export const useSortableSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sortState, handleSort, getSortIcon, getSupabaseOrder } = useSortableTable({
    column: 'name',
    direction: 'asc'
  });

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('suppliers')
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
          'address': 'address',
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
        const formattedSuppliers = data.map(mapDbSupplierToSupplier);
        setSuppliers(formattedSuppliers);
      }
    } catch (error) {
      console.error('Error fetching sorted suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [sortState]);

  return {
    suppliers,
    isLoading,
    sortState,
    handleSort,
    getSortIcon
  };
};