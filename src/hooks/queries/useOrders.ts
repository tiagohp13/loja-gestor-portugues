import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Order } from "@/types";
import { mapOrder } from "./mappers";

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

export function useOrdersQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success("Encomenda eliminada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar encomenda"),
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteOrder: deleteMutation.mutate,
  };
}
