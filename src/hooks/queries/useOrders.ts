import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Order } from "@/types";
import { mapOrder } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { camelToSnake } from "@/integrations/supabase/utils/formatUtils";

// 🧩 Obter todas as encomendas
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
    }),
  );

  return orders.map(mapOrder);
}

// 🗑️ Eliminar encomenda (soft-delete)
async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  if (error) throw error;
  return id;
}

// 🧾 Criar nova encomenda
async function createOrder(order: any) {
  const { items, ...orderData } = order;

  // Converter total → total_amount
  if ("total" in orderData) {
    orderData.total_amount = orderData.total;
    delete orderData.total;
  }

  // Gerar número automaticamente
  if (!orderData.number) {
    const year = new Date().getFullYear();

    // 🧠 Usa a função RPC segura no Supabase
    const { data: nextCounter, error: counterError } = await supabase.rpc("get_next_counter_by_year", {
      p_counter_type: "order", // tipo específico de contador
      p_year_input: year,
    });

    if (counterError) throw counterError;

    const padded = String(nextCounter).padStart(3, "0");
    orderData.number = `ENC-${year}/${padded}`;
  }

  // Converter campos para snake_case
  const orderPayload = await toInsert(orderData);

  const { data: newOrder, error } = await supabase.from("orders").insert(orderPayload).select().single();

  if (error) throw error;

  // Inserir items
  if (items && items.length > 0) {
    const itemsWithOrderId = items.map((item: any) => ({
      ...camelToSnake(item),
      order_id: newOrder.id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);

    if (itemsError) throw itemsError;
  }

  return newOrder;
}

// ✏️ Atualizar encomenda
async function updateOrder({ id, items, ...updates }: any) {
  if ("total" in updates) {
    updates.total_amount = updates.total;
    delete updates.total;
  }

  const updatePayload = await toUpdate(updates);

  const { error } = await supabase.from("orders").update(updatePayload).eq("id", id);

  if (error) throw error;

  if (items !== undefined) {
    const { error: deleteError } = await supabase.from("order_items").delete().eq("order_id", id);

    if (deleteError) throw deleteError;

    if (items.length > 0) {
      const itemsWithOrderId = items.map((item: any) => ({
        ...camelToSnake(item),
        order_id: id,
      }));

      const { error: insertError } = await supabase.from("order_items").insert(itemsWithOrderId);

      if (insertError) throw insertError;
    }
  }

  return id;
}

// 🔍 Obter encomenda por ID
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

// Hooks React Query
export function useOrdersQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: async () => {
      toast.success("Encomenda eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar encomenda"),
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      toast.success("Encomenda criada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar encomenda"),
  });

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: async () => {
      toast.success("Encomenda atualizada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
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
