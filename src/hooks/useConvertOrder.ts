import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useConvertOrder = () => {
  const [isConverting, setIsConverting] = useState(false);
  const queryClient = useQueryClient();

  const convertOrderToStockExit = async (orderId: string, invoiceNumber?: string) => {
    setIsConverting(true);
    try {
      // Fetch order with items
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("Encomenda não encontrada");

      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      // Get next exit number
      const currentYear = new Date().getFullYear();
      const { data: numberData, error: numberError } = await supabase.rpc(
        "get_next_counter_by_year",
        {
          counter_type: "stock_exits", // parâmetro correto conforme tabela counters
          year: currentYear            // parâmetro correto da função
        }
      );

      if (numberError) throw numberError;

      // Formatar número VEN
      const exitNumber = `VEN-${currentYear}/${String(numberData).padStart(3, "0")}`;

      // Create stock exit
      const { data: stockExit, error: exitError } = await supabase
        .from("stock_exits")
        .insert([{
          number: exitNumber,
          client_id: order.client_id,
          client_name: order.client_name || "",
          date: order.date,
          invoice_number: invoiceNumber || "",
          notes: `Convertida da encomenda ${order.number}`,
          from_order_id: order.id,
          from_order_number: order.number,
          discount: order.discount || 0,
        }])
        .select()
        .single();

      if (exitError) throw exitError;

      // Create stock exit items
      if (orderItems && orderItems.length > 0) {
        const exitItems = orderItems.map((item) => ({
          exit_id: stockExit.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          sale_price: item.sale_price,
          discount_percent: item.discount_percent || 0,
        }));

        const { error: exitItemsError } = await supabase
          .from("stock_exit_items")
          .insert(exitItems);

        if (exitItemsError) throw exitItemsError;
      }

      // Update order to mark as converted
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          converted_to_stock_exit_id: stockExit.id,
          converted_to_stock_exit_number: stockExit.number,
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Update stock quantities manually for each product
      for (const item of orderItems || []) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("current_stock")
          .eq("id", item.product_id)
          .single();

        if (!productError && product) {
          await supabase
            .from("products")
            .update({ current_stock: product.current_stock - item.quantity })
            .eq("id", item.product_id);
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stock-exits"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Encomenda convertida em saída com sucesso");
      return stockExit;
    } catch (error: any) {
      console.error("Error converting order:", error);
      toast.error(error.message || "Erro ao converter encomenda");
      return undefined;
    } finally {
      setIsConverting(false);
    }
  };

  return { convertOrderToStockExit, isConverting };
};
