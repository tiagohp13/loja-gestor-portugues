import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { OrderItem } from "./types";
import { useOrderValidation } from "./useOrderValidation";
import { Order } from "@/types";
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
    // 1️⃣ Validar os dados da encomenda
    const validation = validateOrder(selectedClientId, orderItems, orderDate);
    if (!validation.valid) {
      displayValidationError(validation.message || "Dados da encomenda inválidos");
      return;
    }

    try {
      setIsSubmitting(true);

      // 2️⃣ Calcular o total
      const total = orderItems.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);

      // 3️⃣ Criar o objeto da encomenda com nomes corretos (snake_case)
      const newOrder = {
        client_id: selectedClientId,
        client_name: selectedClient?.name,
        date: format(startOfDay(orderDate), "yyyy-MM-dd"),
        items: orderItems.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          sale_price: item.salePrice,
        })),
        notes,
        total,
        status: orderType === "combined" ? "Pendente – Combinada" : "Pendente – A aguardar stock",
        expected_delivery_date: expectedDeliveryDate ? format(startOfDay(expectedDeliveryDate), "yyyy-MM-dd") : null,
        expected_delivery_time: expectedDeliveryTime || null,
        delivery_location: deliveryLocation || null,
      };

      console.log("📝 Order data being submitted:", newOrder);

      // 4️⃣ Submeter encomenda
      const savedOrder = await addOrder(newOrder);

      if (!savedOrder || !savedOrder.id) {
        throw new Error("A criação da encomenda falhou");
      }

      toast({
        title: "Sucesso",
        description: `Encomenda ${savedOrder.number || ""} guardada com sucesso`,
        variant: "default",
      });

      navigate("/encomendas/consultar");
    } catch (error) {
      console.error("❌ Erro ao guardar encomenda:", error);
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
