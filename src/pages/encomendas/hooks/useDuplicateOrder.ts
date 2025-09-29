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
      
      // Fetch the original order and its items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Erro ao buscar encomenda:', orderError);
        toast.error(orderError.message || 'Erro ao buscar a encomenda');
        return;
      }

      if (orderData) {
        // Navigate to new order page with pre-filled data
        navigate('/encomendas/nova', {
          state: {
            duplicateData: {
              clientId: orderData.client_id,
              clientName: orderData.client_name,
              date: orderData.date,
              notes: `Duplicada de ${orderData.number}`,
              discount: orderData.discount || 0,
              items: (orderData.order_items || []).map((item: any) => ({
                id: crypto.randomUUID(), // New ID for the form
                productId: item.product_id,
                productName: item.product_name,
                quantity: item.quantity,
                salePrice: Number(item.sale_price),
                discountPercent: item.discount_percent ? Number(item.discount_percent) : 0
              }))
            }
          }
        });
        toast.success('Dados da encomenda carregados para duplicação');
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