import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Order } from "@/types";
import { mapOrder } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { camelToSnake } from "@/integrations/supabase/utils/formatUtils";

async function fetchOrders(): Promise<Order[]> {
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false });

  if (ordersError) throw ordersError;

  const orders = await Promise.all(
    (ordersData || []).map(async (order) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: itemsData || [],
      };
    })
  );

  return orders.map(mapOrder);
}

async function deleteOrder(id: string) {
  const { error } = await supabase
    .from("orders")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

async function createOrder(order: any) {
  const { items, ...orderData } = order;
  
  // Convert order data to snake_case
  const orderPayload = toInsert(orderData);
  
  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();
  
  if (error) throw error;
  
  if (items && items.length > 0) {
    const itemsWithOrderId = items.map((item: any) => ({
      ...camelToSnake(item),
      order_id: newOrder.id,
    }));
    
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);
    
    if (itemsError) throw itemsError;
  }
  
  return newOrder;
}

async function updateOrder({ id, items, ...updates }: any) {
  // Convert updates to snake_case
  const updatePayload = toUpdate(updates);
  
  const { error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", id);
  
  if (error) throw error;
  
  if (items !== undefined) {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);
    
    if (deleteError) throw deleteError;
    
    // Insert new items
    if (items.length > 0) {
      const itemsWithOrderId = items.map((item: any) => ({
        ...camelToSnake(item),
        order_id: id,
      }));
      
      const { error: insertError } = await supabase
        .from("order_items")
        .insert(itemsWithOrderId);
      
      if (insertError) throw insertError;
    }
  }
  
  return id;
}

async function getOrderById(id: string) {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  
  if (orderError) throw orderError;
  if (!orderData) return null;
  
  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderData.id);
  
  if (itemsError) throw itemsError;
  
  return mapOrder({
    ...orderData,
    items: itemsData || [],
  });
}

export function useOrdersQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 10, // 10 minutes - aggressive caching for dashboard performance
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success("Encomenda eliminada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar encomenda"),
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Encomenda criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar encomenda"),
  });

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      toast.success("Encomenda atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar encomenda"),
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteOrder: deleteMutation.mutate,
    createOrder: createMutation.mutate,
    updateOrder: updateMutation.mutate,
  };
}

export function useOrderQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
