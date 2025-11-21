import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuppliersQuery } from '@/hooks/queries/useSuppliers';
import { supabase } from '@/integrations/supabase/client';
import { Supplier, StockEntry } from '@/types';
import { mapDbSupplierToSupplier } from '@/utils/mappers';

export const useSupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, isLoading: suppliersLoading } = useSuppliersQuery();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierEntries, setSupplierEntries] = useState<any[]>([]);
  const [supplierExpenses, setSupplierExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (!id || suppliersLoading) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      
      // Try to find in loaded suppliers first
      let foundSupplier = suppliers.find(s => s.id === id);
      
      // If not found in loaded suppliers, try to fetch from database (including deleted)
      if (!foundSupplier) {
        try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id, name, email, phone, address, tax_id, payment_terms, notes, status, user_id, total_spent, purchase_count, created_at, updated_at, deleted_at')
          .eq('id', id)
          .single();

          if (error) throw error;

          if (data) {
            foundSupplier = mapDbSupplierToSupplier(data);
            setIsDeleted(data.status === 'deleted');
          }
        } catch (error) {
          console.error('Error fetching supplier:', error);
          setIsLoading(false);
          return;
        }
      }

      if (!foundSupplier) {
        setIsLoading(false);
        return;
      }

      setSupplier(foundSupplier);
      
      // Fetch stock entries for this supplier
      const { data: entriesData } = await supabase
        .from('stock_entries')
        .select('id, number, supplier_id, supplier_name, date, invoice_number, notes, status, user_id, created_at, updated_at, deleted_at')
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
        .select('id, number, supplier_id, supplier_name, date, notes, discount, status, user_id, created_at, updated_at, deleted_at')
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
  }, [id, suppliers, suppliersLoading]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    supplier,
    supplierEntries,
    supplierExpenses,
    isLoading,
    handleNavigate,
    isDeleted,
  };
};

export default useSupplierDetail;
