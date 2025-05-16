
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { OrderItem } from './types';
import { useOrderValidation } from './useOrderValidation';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useOrderSubmit = (
  addOrder: (order: any) => Promise<Order>,
  selectedClientId: string,
  selectedClient: any,
  orderDate: Date,
  orderItems: OrderItem[],
  notes: string,
  setIsSubmitting: (isSubmitting: boolean) => void
) => {
  const navigate = useNavigate();
  const { validateOrder, displayValidationError } = useOrderValidation();
  
  const handleSaveOrder = async () => {
    try {
      // Validar a encomenda
      const validation = validateOrder(selectedClientId, orderItems, orderDate);
      if (!validation.valid) {
        displayValidationError(validation.message || "Dados da encomenda inválidos");
        return;
      }
      
      setIsSubmitting(true);
      console.log("Iniciando processo de salvamento de encomenda");
      
      // Calcular valor total
      const total = orderItems.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
      
      // Obter o ano da data da encomenda
      const orderYear = orderDate.getFullYear();
      
      // Gerar número de encomenda usando a função de contador por ano
      const { data: orderNumber, error: numberError } = await supabase.rpc('get_next_counter_by_year', {
        counter_id: 'order',
        target_year: orderYear
      });
      
      if (numberError) {
        console.error("Erro ao gerar número de encomenda:", numberError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da encomenda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!orderNumber) {
        console.error("Nenhum número de encomenda retornado");
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da encomenda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Número de encomenda gerado:", orderNumber);
      
      // Criar objeto de encomenda com todos os dados necessários
      const newOrder = {
        clientId: selectedClientId,
        clientName: selectedClient?.name,
        date: orderDate.toISOString(),
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          salePrice: item.salePrice
        })),
        notes,
        total,
        number: orderNumber
      };
      
      console.log("Dados da encomenda a ser enviados:", JSON.stringify(newOrder));
      
      try {
        // Submeter a encomenda usando a função addOrder fornecida
        const savedOrder = await addOrder(newOrder);
        
        if (!savedOrder || !savedOrder.id) {
          throw new Error("A criação da encomenda falhou");
        }
        
        console.log("Encomenda guardada com sucesso:", savedOrder);
        
        // Mostrar mensagem de sucesso
        toast({
          title: "Sucesso",
          description: `Encomenda ${savedOrder.number || ''} guardada com sucesso`,
          variant: "default"
        });
        
        // Garantir que o estado de submissão é resetado ANTES da navegação
        setIsSubmitting(false);
        
        // Navegar de volta para a lista de encomendas
        navigate('/encomendas/consultar');
      } catch (error) {
        console.error("Erro ao guardar encomenda:", error);
        toast({
          title: "Erro",
          description: "Erro ao guardar a encomenda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Erro ao processar encomenda:", error);
      toast({
        title: "Erro",
        description: "Erro ao guardar a encomenda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  return {
    handleSaveOrder,
    navigate
  };
};
