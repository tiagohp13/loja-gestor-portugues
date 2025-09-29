import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDuplicateOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const duplicateOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      
      // Call the duplicate_order function
      const { data, error } = await supabase.rpc('duplicate_order', {
        order_id_to_duplicate: orderId
      });

      if (error) {
        console.error('Erro ao duplicar encomenda:', error);
        toast.error(error.message || 'Erro ao duplicar a encomenda');
        return;
      }

      if (data) {
        toast.success('Encomenda duplicada com sucesso!');
        // Navigate to the edit page of the new order
        navigate(`/encomendas/editar/${data}`);
      }
    } catch (error) {
      console.error('Erro ao duplicar encomenda:', error);
      toast.error('Erro inesperado ao duplicar a encomenda');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    duplicateOrder,
    isLoading
  };
};