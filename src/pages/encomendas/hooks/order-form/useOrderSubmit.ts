
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { OrderItem } from './types';
import { useOrderValidation } from './useOrderValidation';

export const useOrderSubmit = (
  addOrder: (order: any) => Promise<void>,
  selectedClientId: string,
  selectedClient: any,
  orderDate: Date,
  orderItems: OrderItem[],
  notes: string,
  setIsSubmitting: (isSubmitting: boolean) => void
) => {
  const navigate = useNavigate();
  const { validateOrder } = useOrderValidation();
  
  const handleSaveOrder = async () => {
    // Validate the order
    const validation = validateOrder(selectedClientId, orderItems);
    if (!validation.valid) {
      toast({
        title: "Erro",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const total = orderItems.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
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
      
      await addOrder(newOrder);
      toast({
        title: "Sucesso",
        description: "Encomenda guardada com sucesso"
      });
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
