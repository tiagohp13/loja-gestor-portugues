
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { Supplier, StockEntry } from '@/types';

export const useSupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplier, getSupplierHistory } = useData();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierEntries, setSupplierEntries] = useState<any[]>([]);
  const [supplierExpenses, setSupplierExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    const fetchData = async () => {
      const foundSupplier = getSupplier(id);
      if (!foundSupplier) {
        setIsLoading(false);
        return;
      }

      setSupplier(foundSupplier);
      
      // Fetch stock entries for this supplier
      const { data: entriesData } = await supabase
        .from('stock_entries')
        .select('*')
        .eq('supplier_id', id)
        .or('status.is.null,status.neq.deleted')
        .order('date', { ascending: false });
      
      if (entriesData) {
        setSupplierEntries(entriesData);
      }

      // Fetch expenses for this supplier
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('supplier_id', id)
        .or('status.is.null,status.neq.deleted')
        .order('date', { ascending: false });
      
      if (expensesData) {
        setSupplierExpenses(expensesData);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [id, getSupplier]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    supplier,
    supplierEntries,
    supplierExpenses,
    isLoading,
    handleNavigate,
  };
};

export default useSupplierDetail;
