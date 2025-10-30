import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockExit } from "@/types";
import { mapStockExit } from "./mappers";

async function fetchStockExits(): Promise<StockExit[]> {
  const { data: exitsData, error: exitsError } = await supabase
    .from("stock_exits")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false });

  if (exitsError) throw exitsError;

  const exits = await Promise.all(
    (exitsData || []).map(async (exit) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from("stock_exit_items")
        .select("*")
        .eq("exit_id", exit.id);

      if (itemsError) throw itemsError;

      return {
        ...exit,
        items: itemsData || [],
      };
    })
  );

  return exits.map(mapStockExit);
}

async function deleteStockExit(id: string) {
  const { error } = await supabase
    .from("stock_exits")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

export function useStockExitsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stock-exits"],
    queryFn: fetchStockExits,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockExit,
    onSuccess: () => {
      toast.success("Saída eliminada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["stock-exits"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar saída"),
  });

  return {
    stockExits: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteStockExit: deleteMutation.mutate,
  };
}
