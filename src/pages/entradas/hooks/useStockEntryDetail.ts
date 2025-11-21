
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockEntriesQuery } from '@/hooks/queries/useStockEntries';
import { useSuppliersQuery } from '@/hooks/queries/useSuppliers';
import { SupplierWithAddress } from '@/types';
import { exportToPdf } from '@/utils/pdfExport';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mapDbStockEntryToStockEntry } from '@/utils/mappers';

export const useStockEntryDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const { stockEntries, isLoading: entriesLoading } = useStockEntriesQuery();
  const { suppliers, isLoading: suppliersLoading } = useSuppliersQuery();
  const [stockEntry, setStockEntry] = useState<any | null>(null);
  const [supplier, setSupplier] = useState<SupplierWithAddress | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [isDeleted, setIsDeleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id || entriesLoading || suppliersLoading) return;

      let entry = stockEntries.find(entry => entry.id === id);
      
      // If not found, fetch from database (including deleted)
      if (!entry) {
        try {
          const { data, error } = await supabase
            .from('stock_entries')
            .select(`
              *,
              stock_entry_items(*)
            `)
            .eq('id', id)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            const items = data.stock_entry_items || [];
            entry = mapDbStockEntryToStockEntry(data, items);
            setIsDeleted(data.status === 'deleted');
          }
        } catch (error) {
          console.error('Error fetching deleted stock entry:', error);
          toast.error('Compra não encontrada');
          navigate('/entradas/historico');
          return;
        }
      }

      if (entry) {
        setStockEntry(entry);
        
        // Calculate total
        if (entry.items && entry.items.length > 0) {
          const sum = entry.items.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);
          setTotalValue(sum);
        }
        
        // Check if the entry has a supplierId and fetch the corresponding supplier
        if (entry.supplierId) {
          const foundSupplier = suppliers.find(s => s.id === entry.supplierId);
          if (foundSupplier) {
            // Create a SupplierWithAddress object from the supplier data
            const supplierWithAddress: SupplierWithAddress = {
              ...foundSupplier,
              address: foundSupplier.address ? {
                street: foundSupplier.address,
                postalCode: '',
                city: ''
              } : undefined
            };
            setSupplier(supplierWithAddress);
          }
        }
      }
    };

    fetchEntry();
  }, [id, stockEntries, navigate, suppliers, entriesLoading, suppliersLoading]);

  const handleExportToPdf = async () => {
    if (stockEntry && stockEntry.number) {
      await exportToPdf({
        filename: stockEntry.number.replace('/', '-'),
        contentSelector: '.pdf-content',
        margin: 10
      });
    }
  };

  return {
    stockEntry,
    supplier,
    totalValue,
    contentRef,
    handleExportToPdf,
    isDeleted
  };
};
