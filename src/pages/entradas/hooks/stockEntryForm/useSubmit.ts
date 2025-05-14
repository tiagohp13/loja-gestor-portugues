
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StockEntryItem } from '@/types';
import { EntryDetails } from './types';

interface UseSubmitProps {
  entryDetails: EntryDetails;
  items: StockEntryItem[];
  entryDate: Date;
  suppliers: Array<{
    id: string;
    name: string;
  }>;
  addStockEntry: (entry: {
    supplierId: string;
    supplierName: string;
    items: StockEntryItem[];
    date: string;
    invoiceNumber: string;
    notes: string;
  }) => Promise<void>;
}

export const useSubmit = ({
  entryDetails,
  items,
  entryDate,
  suppliers,
  addStockEntry
}: UseSubmitProps) => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entryDetails.supplierId || items.length === 0) {
      toast.error('Selecione um fornecedor e adicione pelo menos um produto');
      return;
    }
    
    const supplier = suppliers.find(s => s.id === entryDetails.supplierId);
    
    if (!supplier) {
      toast.error('Fornecedor não encontrado');
      return;
    }
    
    const loadingToast = toast.loading('Registando entrada...');
    
    try {
      await addStockEntry({
        supplierId: entryDetails.supplierId,
        supplierName: supplier.name,
        items: items,
        date: entryDate.toISOString(),
        invoiceNumber: entryDetails.invoiceNumber,
        notes: entryDetails.notes
      });
      
      toast.dismiss(loadingToast);
      toast.success('Entrada registada com sucesso');
      navigate('/entradas/historico');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Erro ao registar entrada:", error);
      toast.error('Erro ao registar entrada');
    }
  };

  return { handleSubmit };
};
