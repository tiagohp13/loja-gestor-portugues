import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockEntry } from "@/types";
import { mapStockEntry } from "./mappers";

const PAGE_SIZE = 25;

async function fetchPaginatedStockEntries(page: number = 0): Promise<{ stockEntries: StockEntry[]; totalCount: number }> {
  const { count } = await supabase
    .from("stock_entries")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data: entriesData, error: entriesError } = await supabase
    .from("stock_entries")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (entriesError) throw entriesError;

  const entries = await Promise.all(
    (entriesData || []).map(async (entry) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from("stock_entry_items")
        .select("*")
        .eq("entry_id", entry.id);

      if (itemsError) throw itemsError;

      return {
        ...entry,
        items: itemsData || [],
      };
    })
  );

  return {
    stockEntries: entries.map(mapStockEntry),
    totalCount: count || 0,
  };
}

async function deleteStockEntry(id: string) {
  const { error } = await supabase
    .from("stock_entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

export function usePaginatedStockEntries(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stock-entries-paginated", page],
    queryFn: () => fetchPaginatedStockEntries(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockEntry,
    onSuccess: async () => {
      toast.success("Entrada eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["stock-entries-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["stock-entries"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar entrada"),
  });

  return {
    stockEntries: query.data?.stockEntries || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteStockEntry: deleteMutation.mutate,
  };
}
