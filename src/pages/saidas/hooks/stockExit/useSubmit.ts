
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ExitDetails, ExitItem } from './types';
import { supabase } from '@/integrations/supabase/client';

interface SubmitProps {
  exitId?: string; // Added this property to fix the error
  exitDetails: ExitDetails;
  items: ExitItem[];
  exitDate: Date;
  saveStockExit?: (exit: any) => Promise<any>; // Made optional
  addStockExit?: (exit: any) => Promise<any>; // Added this property
  updateStockExit?: (id: string, exit: any) => Promise<any>; // Added this property
  clients?: any[];
  products?: any[];
  totalValue?: number;
}

export const useSubmit = ({ 
  exitId,
  exitDetails,
  items,
  exitDate,
  addStockExit,
  updateStockExit,
  saveStockExit,
  clients,
  products,
  totalValue
}: SubmitProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateExit = () => {
    if (!exitDetails.clientId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente",
        variant: "destructive"
      });
      return false;
    }

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateExit()) return;

    try {
      setIsSubmitting(true);
      console.log("Starting stock exit submission process");

      // Find client name if clients array is provided
      const client = clients?.find(c => c.id === exitDetails.clientId);
      
      // Get the year from the exit date
      const exitYear = exitDate.getFullYear();
      
      // Generate exit number using the counter by year function
      const { data: exitNumber, error: numberError } = await supabase.rpc('get_next_counter_by_year', {
        counter_id: 'exit',
        target_year: exitYear
      });
      
      if (numberError) {
        console.error("Error generating exit number:", numberError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da venda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!exitNumber) {
        console.error("No exit number returned");
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da venda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Map items to a format suitable for saving
      const stockExitItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent || 0
      }));

      // Create stock exit object
      const stockExit = {
        clientId: exitDetails.clientId,
        clientName: client ? client.name : exitDetails.clientName,
        date: exitDate.toISOString(),
        notes: exitDetails.notes,
        items: stockExitItems,
        number: exitNumber
      };

      console.log("Stock exit data to save:", stockExit);

      try {
        // Save the stock exit based on whether it's a new exit or an update
        let savedExit;
        
        if (exitId && updateStockExit) {
          // Update existing exit
          savedExit = await updateStockExit(exitId, stockExit);
          console.log("Stock exit updated successfully:", savedExit);
        } else if (addStockExit) {
          // Create new exit
          savedExit = await addStockExit(stockExit);
          console.log("Stock exit created successfully:", savedExit);
        } else if (saveStockExit) {
          // Use legacy saveStockExit if provided
          savedExit = await saveStockExit(stockExit);
          console.log("Stock exit saved successfully:", savedExit);
        } else {
          throw new Error("No save method provided");
        }
        
        // Show success message
        toast({
          title: "Sucesso",
          description: `Venda ${savedExit?.number || ''} guardada com sucesso`,
          variant: "default"
        });
        
        // Navigate to the stock exits list
        navigate('/saidas/historico');
      } catch (saveError) {
        console.error("Error saving stock exit:", saveError);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao guardar a venda: " + (saveError instanceof Error ? saveError.message : "Erro desconhecido"),
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error during stock exit submission:", error);
      toast({
        title: "Erro", 
        description: "Ocorreu um erro ao guardar a venda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    navigate // Export navigate so it can be used in StockExitNew.tsx
  };
};
