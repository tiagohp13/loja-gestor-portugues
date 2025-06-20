import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { StockEntry, StockEntryItem } from '@/types';
import { updateStockEntry } from '@/services/stockService'; // NOVO

interface UseSubmitProps {
  entryDetails: {
    id?: string; // NOVO: permitir edição
    supplierId: string;
    supplierName: string;
    invoiceNumber: string;
    notes: string;
  };
  items: StockEntryItem[];
  entryDate: Date;
  suppliers: any[];
  addStockEntry: (entry: {
    supplierId: string;
    supplierName: string;
    items: StockEntryItem[];
    date: string;
    invoiceNumber: string;
    notes: string;
    total: number;
  }) => Promise<StockEntry>;
}

export const useSubmit = ({
  entryDetails,
  items,
  entryDate,
  suppliers,
  addStockEntry
}: UseSubmitProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!entryDetails.supplierId) {
      toast({
        title: "Erro",
        description: "Selecione um fornecedor",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Calcular total
      const total = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
      
      // Buscar info do fornecedor
      const supplier = suppliers.find(s => s.id === entryDetails.supplierId);
      
      const stockEntry = {
        supplierId: entryDetails.supplierId,
        supplierName: supplier ? supplier.name : entryDetails.supplierName,
        items,
        date: entryDate.toISOString(),
        invoiceNumber: entryDetails.invoiceNumber,
        notes: entryDetails.notes,
        total
      };

      if (entryDetails.id) {
        await updateStockEntry(entryDetails.id, stockEntry); // EDIÇÃO
      } else {
        await addStockEntry(stockEntry); // NOVA ENTRADA
      }

      toast({
        title: "Sucesso",
        description: "Entrada de stock guardada com sucesso"
      });
      
      navigate('/entradas/historico');
    } catch (error) {
      console.error("Error during stock entry submission:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao guardar a entrada de stock: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
