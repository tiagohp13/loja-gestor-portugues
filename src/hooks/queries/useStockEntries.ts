import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockEntry } from "@/types";
import { mapStockEntry } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { camelToSnake } from "@/integrations/supabase/utils/formatUtils";

async function fetchStockEntries(): Promise<StockEntry[]> {
  // Fetch all entries
  const { data: entriesData, error: entriesError } = await supabase
    .from("stock_entries")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false });

  if (entriesError) throw entriesError;
  if (!entriesData || entriesData.length === 0) return [];

  // Get all entry IDs
  const entryIds = entriesData.map(e => e.id);

  // Fetch ALL items in a single query (batch operation)
  const { data: allItemsData, error: itemsError } = await supabase
    .from("stock_entry_items")
    .select("*")
    .in("entry_id", entryIds);

  if (itemsError) throw itemsError;

  // Group items by entry_id in memory
  const itemsByEntryId = (allItemsData || []).reduce((acc, item) => {
    if (!acc[item.entry_id]) {
      acc[item.entry_id] = [];
    }
    acc[item.entry_id].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Combine entries with their items
  const entries = entriesData.map((entry) => ({
    ...entry,
    items: itemsByEntryId[entry.id] || [],
  }));

  return entries.map(mapStockEntry);
}

async function deleteStockEntry(id: string) {
  const { error } = await supabase
    .from("stock_entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

export function useStockEntriesQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stock-entries"],
    queryFn: fetchStockEntries,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockEntry,
    onSuccess: async () => {
      toast.success("Entrada eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["stock-entries"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar entrada"),
  });

  return {
    stockEntries: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteStockEntry: deleteMutation.mutate,
  };
}
