
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockExit, StockExitItem } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { ExitDetails } from './types';

interface UseSubmitProps {
  exitId?: string;
  exitDetails: ExitDetails;
  items: StockExitItem[];
  exitDate: Date;
  addStockExit: (exit: Omit<StockExit, 'number' | 'id' | 'createdAt'>) => Promise<StockExit>;
  updateStockExit: (id: string, exit: Omit<StockExit, 'number' | 'id' | 'createdAt'>) => Promise<StockExit | void>;
}

export const useSubmit = ({
  exitId,
  exitDetails,
  items,
  exitDate,
  addStockExit,
  updateStockExit
}: UseSubmitProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!exitDetails.clientId) {
      toast({ 
        title: "Erro", 
        description: "Selecione um cliente",
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
      
      // Calculate total value
      const total = items.reduce((sum, item) => {
        return sum + (item.quantity * item.salePrice);
      }, 0);
      
      const exitData: Omit<StockExit, "number" | "id" | "createdAt"> = {
        clientId: exitDetails.clientId,
        clientName: exitDetails.clientName,
        date: exitDate.toISOString(),
        invoiceNumber: exitDetails.invoiceNumber || undefined,
        notes: exitDetails.notes,
        discount: exitDetails.discount,
        items,
        fromOrderId: undefined,
        fromOrderNumber: undefined,
        total // Add total value to stock exit
      };
      
      if (exitId) {
        await updateStockExit(exitId, exitData);
        toast({ 
          title: "Sucesso", 
          description: "Venda atualizada com sucesso" 
        });
      } else {
        await addStockExit(exitData);
        toast({ 
          title: "Sucesso", 
          description: "Venda criada com sucesso" 
        });
      }
      
      navigate('/saidas/historico');
    } catch (error) {
      console.error("Error saving stock exit:", error);
      toast({ 
        title: "Erro", 
        description: "Ocorreu um erro ao salvar a venda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    navigate,
    isSubmitting
  };
};
