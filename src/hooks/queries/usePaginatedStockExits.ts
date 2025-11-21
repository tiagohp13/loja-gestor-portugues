import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockExit } from "@/types";
import { mapStockExit } from "./mappers";

const PAGE_SIZE = 25;

async function fetchPaginatedStockExits(page: number = 0): Promise<{ stockExits: StockExit[]; totalCount: number }> {
  const { count } = await supabase
    .from("stock_exits")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data: exitsData, error: exitsError } = await supabase
    .from("stock_exits")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (exitsError) throw exitsError;

  if (!exitsData || exitsData.length === 0) {
    return {
      stockExits: [],
      totalCount: count || 0,
    };
  }

  // Fetch all items in a single query
  const exitIds = exitsData.map(exit => exit.id);
  const { data: allItemsData, error: itemsError } = await supabase
    .from("stock_exit_items")
    .select("*")
    .in("exit_id", exitIds);

  if (itemsError) throw itemsError;

  // Group items by exit_id
  const itemsByExitId = (allItemsData || []).reduce((acc, item) => {
    if (!acc[item.exit_id!]) {
      acc[item.exit_id!] = [];
    }
    acc[item.exit_id!].push(item);
    return acc;
  }, {} as Record<string, typeof allItemsData>);

  // Map exits with their items
  const exits = exitsData.map(exit => ({
    ...exit,
    items: itemsByExitId[exit.id] || [],
  }));

  return {
    stockExits: exits.map(mapStockExit),
    totalCount: count || 0,
  };
}

async function deleteStockExit(id: string) {
  const { error } = await supabase
    .from("stock_exits")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

export function usePaginatedStockExits(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stock-exits-paginated", page],
    queryFn: () => fetchPaginatedStockExits(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockExit,
    onSuccess: async () => {
      toast.success("Saída eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["stock-exits-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["stock-exits"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar saída"),
  });

  return {
    stockExits: query.data?.stockExits || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteStockExit: deleteMutation.mutate,
  };
}
