
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { OrderItem } from './types';
import { useOrderValidation } from './useOrderValidation';
import { Order } from '@/types';

// Updated the addOrder parameter type to match what's provided from DataContext
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
      
      // Create order object with all required data
      const newOrder = {
        clientId: selectedClientId,
        clientName: selectedClient.name,
        date: orderDate.toISOString(),
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          salePrice: item.salePrice
        })),
        notes,
        total  // Adding total value to the order
      };
      
      // Submit the order
      const savedOrder = await addOrder(newOrder);
      
      // Show success message
      toast({
        title: "Sucesso",
        description: `Encomenda ${savedOrder.number || ''} guardada com sucesso`
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
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    handleSaveOrder,
    navigate
  };
};
