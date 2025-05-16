
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { EntryDetails } from './types';
import { StockEntryItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { StockEntry } from '@/types';

interface SubmitProps {
  entryDetails: EntryDetails;
  items: StockEntryItem[];
  entryDate: Date;
  addStockEntry: (entry: any) => Promise<StockEntry>;
  suppliers?: any[];
}

export const useSubmit = ({
  entryDetails,
  items,
  entryDate,
  addStockEntry,
  suppliers
}: SubmitProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEntry = () => {
    if (!entryDetails.supplierId) {
      toast({
        title: "Erro",
        description: "Selecione um fornecedor",
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
    if (!validateEntry()) return;

    try {
      setIsSubmitting(true);
      console.log("Iniciando processo de salvamento de entrada de stock");

      // Encontrar nome do fornecedor se o array de fornecedores for fornecido
      const supplier = suppliers?.find(s => s.id === entryDetails.supplierId);
      
      // Obter o ano da data de entrada
      const entryYear = entryDate.getFullYear();
      
      // Gerar número de entrada usando a função de contador por ano
      const { data: entryNumber, error: numberError } = await supabase.rpc('get_next_counter_by_year', {
        counter_id: 'entry',
        target_year: entryYear
      });
      
      if (numberError) {
        console.error("Erro ao gerar número de entrada:", numberError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da entrada",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!entryNumber) {
        console.error("Nenhum número de entrada retornado");
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da entrada",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Mapear itens para um formato adequado para salvar
      const stockEntryItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        discountPercent: item.discountPercent || 0
      }));

      // Criar objeto de entrada de stock
      const stockEntry = {
        supplierId: entryDetails.supplierId,
        supplierName: supplier ? supplier.name : entryDetails.supplierName,
        date: entryDate.toISOString(),
        invoiceNumber: entryDetails.invoiceNumber || null,
        notes: entryDetails.notes,
        items: stockEntryItems,
        number: entryNumber
      };

      console.log("Dados da entrada a serem salvos:", stockEntry);

      try {
        // Submeter a entrada usando a função addStockEntry fornecida
        const savedEntry = await addStockEntry(stockEntry);
        
        if (!savedEntry || !savedEntry.id) {
          throw new Error("A criação da entrada falhou");
        }
        
        console.log("Entrada guardada com sucesso:", savedEntry);
        
        // Mostrar mensagem de sucesso
        toast({
          title: "Sucesso",
          description: `Entrada ${savedEntry.number || ''} guardada com sucesso`,
          variant: "default"
        });
        
        // Garantir que o estado de submissão é resetado antes da navegação
        setIsSubmitting(false);
        
        // Navegar para a lista de entradas
        navigate('/entradas/historico');
      } catch (error) {
        console.error("Erro ao salvar entrada:", error);
        toast({
          title: "Erro",
          description: "Erro ao guardar a entrada: " + (error instanceof Error ? error.message : "Erro desconhecido"),
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Erro ao processar entrada:", error);
      toast({
        title: "Erro",
        description: "Erro ao guardar a entrada: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    setIsSubmitting,
    navigate
  };
};
