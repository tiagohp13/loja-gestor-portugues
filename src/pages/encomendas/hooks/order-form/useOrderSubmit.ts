import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OrderItem } from "./types";
import { useOrderValidation } from "./useOrderValidation";
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay } from "date-fns";

export const useOrderSubmit = (
  createOrder: (order: any, callbacks?: any) => void,
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

    setIsSubmitting(true);

    // ✅ Calcular total
    const total = orderItems.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);

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

      // ✅ Enviar datas formatadas corretamente como strings
      expectedDeliveryDate: expectedDeliveryDate ? format(startOfDay(expectedDeliveryDate), "yyyy-MM-dd") : null,
      expectedDeliveryTime: expectedDeliveryTime || null,
      deliveryLocation: deliveryLocation || null,
    };

    // ✅ Guardar encomenda usando React Query mutation
    createOrder(newOrder as any, {
      onSuccess: (savedOrder: any) => {
        navigate("/encomendas/consultar");
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  return {
    handleSaveOrder,
    navigate,
  };
};
