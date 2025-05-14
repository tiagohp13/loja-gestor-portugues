
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { StockEntry, StockEntryItem } from '@/types';
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
  }) => Promise<StockEntry>;  // Changed from Promise<void> to Promise<StockEntry>
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
      toast({
        title: "Erro",
        description: "Selecione um fornecedor e adicione pelo menos um produto",
        variant: "destructive"
      });
      return;
    }
    
    const supplier = suppliers.find(s => s.id === entryDetails.supplierId);
    
    if (!supplier) {
      toast({
        title: "Erro",
        description: "Fornecedor não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Informação",
        description: "Registando entrada..."
      });
      
      await addStockEntry({
        supplierId: entryDetails.supplierId,
        supplierName: supplier.name,
        items: items,
        date: entryDate.toISOString(),
        invoiceNumber: entryDetails.invoiceNumber,
        notes: entryDetails.notes
      });
      
      toast({
        title: "Sucesso",
        description: "Entrada registada com sucesso"
      });
      navigate('/entradas/historico');
    } catch (error) {
      console.error("Erro ao registar entrada:", error);
      toast({
        title: "Erro",
        description: "Erro ao registar entrada",
        variant: "destructive"
      });
    }
  };

  return { handleSubmit };
};
