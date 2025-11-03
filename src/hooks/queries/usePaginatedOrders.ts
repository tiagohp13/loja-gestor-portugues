import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Order } from "@/types";
import { mapOrder } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { camelToSnake } from "@/integrations/supabase/utils/formatUtils";

const PAGE_SIZE = 25;

async function fetchPaginatedOrders(page: number = 0): Promise<{ orders: Order[]; totalCount: number }> {
  // Get total count
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  // Fetch paginated data
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

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

  return {
    orders: orders.map(mapOrder),
    totalCount: count || 0,
  };
}

async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  if (error) throw error;
  return id;
}

async function createOrder(order: any) {
  const { items, ...orderData } = order;

  if ("total" in orderData) {
    orderData.total_amount = orderData.total;
    delete orderData.total;
  }

  if (!orderData.number) {
    const year = new Date().getFullYear();
    
    const { data: counterData, error: counterError } = await supabase
      .from("counters")
      .select("current_count")
      .eq("id", "order")
      .eq("year", year)
      .maybeSingle();

    let currentCount = 1;

    if (counterError) throw counterError;

    if (counterData) {
      currentCount = counterData.current_count + 1;
      const { error: updateError } = await supabase
        .from("counters")
        .update({ current_count: currentCount })
        .eq("id", "order")
        .eq("year", year);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("counters")
        .insert({ id: "order", year, current_count: 1 });

      if (insertError) throw insertError;
    }

    const padded = String(currentCount).padStart(3, "0");
    orderData.number = `ENC-${year}/${padded}`;
  }

  const orderPayload = await toInsert(orderData);

  const { data: newOrder, error } = await supabase.from("orders").insert(orderPayload).select().single();

  if (error) throw error;

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

export function usePaginatedOrders(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["orders-paginated", page],
    queryFn: () => fetchPaginatedOrders(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: async () => {
      toast.success("Encomenda eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["orders-paginated"] });
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
      await queryClient.invalidateQueries({ queryKey: ["orders-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar encomenda"),
  });

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: async () => {
      toast.success("Encomenda atualizada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["orders-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar encomenda"),
  });

  return {
    orders: query.data?.orders || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteOrder: deleteMutation.mutate,
    createOrder: createMutation.mutate,
    updateOrder: updateMutation.mutate,
  };
}
