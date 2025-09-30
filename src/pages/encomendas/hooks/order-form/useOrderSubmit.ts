
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { OrderItem } from './types';
import { useOrderValidation } from './useOrderValidation';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay } from 'date-fns';

export const useOrderSubmit = (
  addOrder: (order: any) => Promise<Order>,
  selectedClientId: string,
  selectedClient: any,
  orderDate: Date,
  orderItems: OrderItem[],
  notes: string,
  setIsSubmitting: (isSubmitting: boolean) => void,
  orderType: 'combined' | 'awaiting_stock',
  expectedDeliveryDate?: Date,
  expectedDeliveryTime?: string,
  deliveryLocation?: string
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
      
      console.log("Submitting order with total:", total);
      
      // Create order object with all required data
      const newOrder = {
        clientId: selectedClientId,
        clientName: selectedClient?.name,
        date: format(startOfDay(orderDate), 'yyyy-MM-dd'),
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          salePrice: item.salePrice
        })),
        notes,
        total,  // Adding total value to the order
        orderType,
        expectedDeliveryDate: expectedDeliveryDate 
          ? format(startOfDay(expectedDeliveryDate), 'yyyy-MM-dd')
          : undefined,
        expectedDeliveryTime,
        deliveryLocation
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
        // If the addOrder function fails, make sure we show an error
        throw error;
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
