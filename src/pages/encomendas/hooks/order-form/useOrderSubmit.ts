import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { OrderItem } from "./types";
import { useOrderValidation } from "./useOrderValidation";
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay } from "date-fns";

export const useOrderSubmit = (
  addOrder: (order: any) => Promise<Order>,
  selectedClientId: string,
  selectedClient: any,
  orderDate: Date,
  orderItems: OrderItem[],
  notes: string,
  setIsSubmitting: (isSubmitting: boolean) => void,
  orderType: "combined" | "awaiting_stock",
  expectedDeliveryDate?: Date,
  expectedDeliveryTime?: string,
  deliveryLocation?: string,
) => {
  const navigate = useNavigate();
  const { validateOrder, displayValidationError } = useOrderValidation();

  const handleSaveOrder = async () => {
    // ✅ Validar encomenda
    const validation = validateOrder(selectedClientId, orderItems, orderDate);
    if (!validation.valid) {
      displayValidationError(validation.message || "Dados da encomenda inválidos");
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Calcular total
      const total = orderItems.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
      console.log("Submitting order with total:", total);

      // ✅ Criar objeto da encomenda
      const newOrder = {
        clientId: selectedClientId,
        clientName: selectedClient?.name,
        date: format(startOfDay(orderDate), "yyyy-MM-dd"),
        items: orderItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          salePrice: item.salePrice,
        })),
        notes,
        total,
        orderType,

        // ✅ Corrigido — enviar Date e strings diretamente (sem format)
        expectedDeliveryDate: expectedDeliveryDate || null,
        expectedDeliveryTime: expectedDeliveryTime || null,
        deliveryLocation: deliveryLocation || null,
      };

      console.log("Order data being submitted:", JSON.stringify(newOrder));

      // ✅ Guardar encomenda
      try {
        const savedOrder = await addOrder(newOrder);

        if (!savedOrder || !savedOrder.id) {
          throw new Error("A criação da encomenda falhou");
        }

        console.log("Order saved successfully:", savedOrder);

        toast({
          title: "Sucesso",
          description: `Encomenda ${savedOrder.number || ""} guardada com sucesso`,
          variant: "default",
        });

        // ✅ Redirecionar para a listagem
        navigate("/encomendas/consultar");
      } catch (error) {
        console.error("Error saving order:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Erro",
        description: "Erro ao guardar a encomenda: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return {
    handleSaveOrder,
    navigate,
  };
};
