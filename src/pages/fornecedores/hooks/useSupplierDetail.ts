
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
        // Calculate total value for each entry
        const entriesWithValues = await Promise.all(
          entriesData.map(async (entry) => {
            const { data: itemsData } = await supabase
              .from('stock_entry_items')
              .select('quantity, purchase_price, discount_percent')
              .eq('entry_id', entry.id);
            
            let entryValue = 0;
            if (itemsData && itemsData.length > 0) {
              entryValue = itemsData.reduce((sum, item) => {
                const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
                return sum + (item.quantity * item.purchase_price * discountMultiplier);
              }, 0);
            }
            
            return { ...entry, value: entryValue };
          })
        );
        setSupplierEntries(entriesWithValues);
      }

      // Fetch expenses for this supplier
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('supplier_id', id)
        .or('status.is.null,status.neq.deleted')
        .order('date', { ascending: false });
      
      if (expensesData) {
        // Calculate total value for each expense
        const expensesWithValues = await Promise.all(
          expensesData.map(async (expense) => {
            const { data: itemsData } = await supabase
              .from('expense_items')
              .select('quantity, unit_price, discount_percent')
              .eq('expense_id', expense.id);
            
            let expenseValue = 0;
            if (itemsData && itemsData.length > 0) {
              expenseValue = itemsData.reduce((sum, item) => {
                const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
                return sum + (item.quantity * item.unit_price * discountMultiplier);
              }, 0);
            }
            
            return { ...expense, value: expenseValue };
          })
        );
        setSupplierExpenses(expensesWithValues);
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
