
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { SupplierWithAddress } from '@/types';
import { exportToPdf } from '@/utils/pdfExport';
import { toast } from 'sonner';

export const useStockEntryDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const { stockEntries, suppliers } = useData();
  const [stockEntry, setStockEntry] = useState<any | null>(null);
  const [supplier, setSupplier] = useState<SupplierWithAddress | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const entry = stockEntries.find(entry => entry.id === id);
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
      } else {
        toast.error('Compra não encontrada');
        navigate('/entradas/historico');
      }
    }
  }, [id, stockEntries, navigate, suppliers]);

  const handleExportToPdf = async () => {
    if (stockEntry && stockEntry.number) {
      // Find the supplier with address format
      const supplierData = suppliers.find(s => s.id === stockEntry.supplierId);
      const supplierWithAddress = supplierData ? {
        ...supplierData,
        address: supplierData.address ? {
          street: supplierData.address,
          postalCode: '',
          city: ''
        } : undefined
      } : undefined;

      await exportToPdf({
        filename: stockEntry.number.replace('/', '-'),
        stockExit: stockEntry,
        client: supplierWithAddress,
        totalValue
      });
    }
  };

  return {
    stockEntry,
    supplier,
    totalValue,
    contentRef,
    handleExportToPdf
  };
};
