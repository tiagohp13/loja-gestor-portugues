
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ExitDetails } from './types';
import { StockExit, StockExitItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface SubmitProps {
  exitId?: string;
  exitDetails: ExitDetails;
  items: StockExitItem[];
  exitDate: Date;
  addStockExit?: (exit: any) => Promise<StockExit>;
  updateStockExit?: (id: string, exit: any) => Promise<StockExit>;
  clients?: any[];
}

export const useSubmit = ({ 
  exitId,
  exitDetails,
  items,
  exitDate,
  addStockExit,
  updateStockExit,
  clients
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
      console.log("Iniciando processo de salvamento de venda");

      // Encontrar nome do cliente se o array de clientes for fornecido
      const client = clients?.find(c => c.id === exitDetails.clientId);
      
      // Obter o ano da data de venda
      const exitYear = exitDate.getFullYear();
      
      // Gerar número de venda usando a função de contador por ano
      const { data: exitNumber, error: numberError } = await supabase.rpc('get_next_counter_by_year', {
        counter_id: 'exit',
        target_year: exitYear
      });
      
      if (numberError) {
        console.error("Erro ao gerar número de venda:", numberError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da venda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!exitNumber) {
        console.error("Nenhum número de venda retornado");
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da venda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Mapear itens para um formato adequado para salvar
      const stockExitItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent || 0
      }));

      // Criar objeto de venda
      const stockExit = {
        clientId: exitDetails.clientId,
        clientName: client ? client.name : exitDetails.clientName,
        date: exitDate.toISOString(),
        notes: exitDetails.notes,
        items: stockExitItems,
        number: exitNumber
      };

      console.log("Dados da venda a serem salvos:", stockExit);

      try {
        // Salvar a venda com base em se é uma nova venda ou uma atualização
        let savedExit;
        
        if (exitId && updateStockExit) {
          // Atualizar venda existente
          savedExit = await updateStockExit(exitId, stockExit);
          console.log("Venda atualizada com sucesso:", savedExit);
        } else if (addStockExit) {
          // Criar nova venda
          savedExit = await addStockExit(stockExit);
          console.log("Venda criada com sucesso:", savedExit);
        } else {
          throw new Error("Nenhum método de salvamento fornecido");
        }
        
        // Mostrar mensagem de sucesso
        toast({
          title: "Sucesso",
          description: `Venda ${savedExit?.number || ''} guardada com sucesso`,
          variant: "default"
        });
        
        // Garantir que o estado de submissão é resetado ANTES da navegação
        setIsSubmitting(false);
        
        // Navegar para a lista de vendas
        navigate('/saidas/historico');
      } catch (saveError) {
        console.error("Erro ao salvar venda:", saveError);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao guardar a venda: " + (saveError instanceof Error ? saveError.message : "Erro desconhecido"),
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Erro durante o processo de envio de venda:", error);
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
    navigate
  };
};
