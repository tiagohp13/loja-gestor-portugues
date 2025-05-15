
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ExitDetails, ExitItem } from './types';
import { supabase } from '@/integrations/supabase/client';

interface UseSubmitProps {
  exitId?: string;
  exitDetails: ExitDetails;
  items: ExitItem[];
  exitDate: Date;
  addStockExit: (exit: any) => Promise<any>;
  updateStockExit: (id: string, exit: any) => Promise<any>;
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
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto à venda",
        variant: "destructive"
      });
      return;
    }

    if (!exitDetails.clientId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para a venda",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar itens para salvar
      const exitItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent || 0
      }));

      // Extrair ano da data de venda para numeração correta
      const exitYear = exitDate.getFullYear();
      
      if (exitId) {
        // Atualização de venda existente
        const result = await updateStockExit(exitId, {
          clientId: exitDetails.clientId,
          clientName: exitDetails.clientName,
          date: exitDate.toISOString(),
          notes: exitDetails.notes,
          status: "completed",
          reason: "sale",
          items: exitItems
        });

        if (result) {
          toast({
            title: "Sucesso",
            description: "Venda atualizada com sucesso",
          });
          navigate(`/saidas/${exitId}`);
        }
      } else {
        // Nova venda - usar a nova função que considera o ano da venda
        let exitNumber;
        
        // Obter número de saída baseado no ano da data da venda, não no ano atual
        const { data: numberData, error: numberError } = await supabase
          .rpc('get_next_counter_by_year', { 
            counter_id: 'exit',
            target_year: exitYear
          });
          
        if (numberError) {
          console.error("Erro ao obter número da venda:", numberError);
          toast({
            title: "Erro",
            description: "Não foi possível gerar o número da venda.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        exitNumber = numberData;

        // Criar nova venda com o número correto
        const newExit = {
          clientId: exitDetails.clientId,
          clientName: exitDetails.clientName,
          date: exitDate.toISOString(),
          notes: exitDetails.notes,
          number: exitNumber,
          status: "completed",
          reason: "sale",
          items: exitItems
        };

        const result = await addStockExit(newExit);

        if (result) {
          toast({
            title: "Sucesso",
            description: "Venda registada com sucesso",
          });
          navigate(`/saidas/${result.id}`);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao guardar a venda",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    navigate
  };
};
