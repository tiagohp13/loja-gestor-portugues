import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useStockExit = (
  addStockExit: (exit: Omit<StockExit, 'number' | 'id' | 'createdAt'>) => Promise<StockExit>,
  updateStockExit: (id: string, exit: any) => Promise<StockExit>,
  deleteStockExit: (id: string) => Promise<void>
) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveExit = async (exit: Omit<StockExit, 'number' | 'id' | 'createdAt'>) => {
    try {
      setIsSubmitting(true);
      console.log("Iniciando processo de salvamento de saída de stock");

      // Obter o ano da data de saída
      const exitYear = new Date(exit.date).getFullYear();
      
      // Gerar número de saída usando a função de contador por ano
      const { data: exitNumber, error: numberError } = await supabase.rpc('get_next_counter_by_year', {
        counter_id: 'exit',
        target_year: exitYear
      });
      
      if (numberError) {
        console.error("Erro ao gerar número de saída:", numberError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da saída",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!exitNumber) {
        console.error("Nenhum número de saída retornado");
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da saída",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const newExit = {
        ...exit,
        number: exitNumber
      };

      console.log("Dados da saída a serem salvos:", newExit);

      const savedExit = await addStockExit(newExit);

      toast({
        title: "Sucesso",
        description: `Saída ${savedExit.number || ''} guardada com sucesso`,
        variant: "default"
      });

      navigate('/saidas/historico');
    } catch (error) {
      console.error("Erro ao salvar saída:", error);
      toast({
        title: "Erro",
        description: "Erro ao guardar a saída: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExit = async (id: string, exit: any) => {
    try {
      setIsSubmitting(true);
      console.log(`Iniciando processo de atualização da saída de stock com ID: ${id}`);
  
      const result = await updateStockExit(id, exit);
  
      toast({
        title: "Sucesso",
        description: `Saída ${result.number || ''} atualizada com sucesso`,
        variant: "default"
      });
  
      navigate('/saidas/historico');
      return result as StockExit; // Ensure it returns the correct type
    } catch (error) {
      console.error("Erro ao atualizar saída:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar a saída: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
      throw error; // Instead of returning void, throw the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExit = async (id: string) => {
    try {
      setIsSubmitting(true);
      console.log(`Iniciando processo de remoção da saída de stock com ID: ${id}`);

      await deleteStockExit(id);

      toast({
        title: "Sucesso",
        description: "Saída removida com sucesso",
        variant: "default"
      });

      navigate('/saidas/historico');
    } catch (error) {
      console.error("Erro ao remover saída:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover a saída: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSaveExit,
    handleUpdateExit,
    handleDeleteExit
  };
};
