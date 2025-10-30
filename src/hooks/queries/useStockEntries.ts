import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockEntry } from "@/types";
import { mapStockEntry } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { camelToSnake } from "@/integrations/supabase/utils/formatUtils";

async function fetchStockEntries(): Promise<StockEntry[]> {
  const { data: entriesData, error: entriesError } = await supabase
    .from("stock_entries")
    .select("*")
    .is("deleted_at", null)
    .order("date", { ascending: false });

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
