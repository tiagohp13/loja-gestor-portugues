import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/errorUtils";
import { Order } from "../types";
import { mapDbOrderToOrder, mapOrderItemToDbOrderItem } from "../utils/mappers";

interface OrdersContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, "id" | "number">) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  findOrder: (id: string) => Order | undefined;
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};

export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(*)
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedOrders = data.map((order) => {
          const items = order.order_items || [];
          return mapDbOrderToOrder(order, items);
        });

        formattedOrders.forEach((order) => {
          if (order.items && order.items.length > 0) {
            const total = order.items.reduce((sum, item) => {
              const subtotal = item.quantity * item.salePrice;
              const discount = subtotal * ((item.discountPercent || 0) / 100);
              return sum + (subtotal - discount);
            }, 0);
            order.total = total;
          } else {
            order.total = 0;
          }
        });

        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Erro ao carregar encomendas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel("public:orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const findOrder = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  };

  const addOrder = async (order: Omit<Order, "id" | "number">) => {
    try {
      const { data: orderNumberData, error: orderNumberError } = await supabase.rpc("get_next_counter", {
        counter_id: "order",
      });

      if (orderNumberError) throw orderNumberError;

      const orderNumber =
        orderNumberData ||
        `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`;

      const { data, error } = await supabase
        .from("orders")
        .insert({
          number: orderNumber,
          client_id: order.clientId,
          client_name: order.clientName,
          date: order.date,
          notes: order.notes,
          discount: order.discount,
          converted_to_stock_exit_id: order.convertedToStockExitId,
          converted_to_stock_exit_number: order.convertedToStockExitNumber,
          order_type: order.orderType || "combined",
          expected_delivery_date: order.expectedDeliveryDate || null,
          expected_delivery_time: order.expectedDeliveryTime || null,
          delivery_location: order.deliveryLocation || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to add order");

      const orderItems = order.items.map((item) => mapOrderItemToDbOrderItem(item, data.id));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

      const newOrder: Order = {
        id: data.id,
        number: data.number,
        clientId: data.client_id || "",
        clientName: data.client_name || "",
        date: data.date,
        notes: data.notes || "",
        discount: Number(data.discount || 0),
        convertedToStockExitId: data.converted_to_stock_exit_id,
        convertedToStockExitNumber: data.converted_to_stock_exit_number,
        expectedDeliveryDate: data.expected_delivery_date || null,
        expectedDeliveryTime: data.expected_delivery_time || null,
        deliveryLocation: data.delivery_location || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: order.items,
        total: order.total,
      };

      setOrders([newOrder, ...orders]);
      toast.success("Encomenda criada com sucesso");
      return newOrder;
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível criar a encomenda"));
      throw error;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          client_id: order.clientId,
          client_name: order.clientName,
          date: order.date,
          notes: order.notes,
          discount: order.discount,
          converted_to_stock_exit_id: order.convertedToStockExitId,
          converted_to_stock_exit_number: order.convertedToStockExitNumber,
          order_type: order.orderType,
          expected_delivery_date: order.expectedDeliveryDate || null,
          expected_delivery_time: order.expectedDeliveryTime || null,
          delivery_location: order.deliveryLocation || null,
        })
        .eq("id", id);

      if (error) throw error;

      if (order.items) {
        const { error: deleteError } = await supabase.from("order_items").delete().eq("order_id", id);

        if (deleteError) throw deleteError;

        const orderItems = order.items.map((item) => mapOrderItemToDbOrderItem(item, id));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

        if (itemsError) throw itemsError;
      }

      setOrders(
        orders.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              ...order,
              items: order.items || o.items,
            };
          }
          return o;
        })
      );
      toast.success("Encomenda atualizada com sucesso");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar a encomenda"));
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "orders",
        record_id: id,
      });

      if (error) throw error;

      setOrders(orders.filter((o) => o.id !== id));
      toast.success("Encomenda eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar a encomenda"));
      throw error;
    }
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        setOrders,
        addOrder,
        updateOrder,
        deleteOrder,
        findOrder,
        isLoading,
        refreshOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};
