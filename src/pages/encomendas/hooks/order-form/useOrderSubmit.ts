
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
    // Validate the order
    const validation = validateOrder(selectedClientId, orderItems, orderDate);
    if (!validation.valid) {
      displayValidationError(validation.message || "Dados da encomenda inválidos");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate total value
      const total = orderItems.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
      
      // Get the year from the order date
      const orderYear = orderDate.getFullYear();
      
      // Generate order number using the counter by year function
      const { data: orderNumber, error: numberError } = await supabase.rpc('get_next_counter_by_year', {
        counter_id: 'order',
        target_year: orderYear
      });
      
      if (numberError) {
        console.error("Error generating order number:", numberError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da encomenda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!orderNumber) {
        console.error("No order number returned");
        toast({
          title: "Erro",
          description: "Não foi possível gerar o número da encomenda",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Generated order number:", orderNumber);
      
      // Create order object with all required data
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
      
      console.log("Order data being submitted:", JSON.stringify(newOrder));
      
      // Submit the order using the provided addOrder function
      try {
        const savedOrder = await addOrder(newOrder);
        
        if (!savedOrder || !savedOrder.id) {
          throw new Error("A criação da encomenda falhou");
        }
        
        console.log("Order saved successfully:", savedOrder);
        
        // Show success message
        toast({
          title: "Sucesso",
          description: `Encomenda ${savedOrder.number || ''} guardada com sucesso`,
          variant: "default"
        });
        
        // Navigate back to order list
        navigate('/encomendas/consultar');
      } catch (error) {
        console.error("Error saving order:", error);
        toast({
          title: "Erro",
          description: "Erro ao guardar a encomenda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
          variant: "destructive"
        });
        // Make sure we're not redirecting on error and isSubmitting is reset
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Erro",
        description: "Erro ao guardar a encomenda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive"
      });
      // Make sure we're not redirecting on error and isSubmitting is reset
      setIsSubmitting(false);
    }
  };
  
  return {
    handleSaveOrder,
    navigate
  };
};
