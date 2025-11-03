import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "@/types";
import { mapCategory } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";

const PAGE_SIZE = 25;

async function fetchPaginatedCategories(page: number = 0): Promise<{ categories: Category[]; totalCount: number }> {
  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("name")
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  
  if (error) throw error;
  return {
    categories: (data || []).map(mapCategory),
    totalCount: count || 0,
  };
}

async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

async function createCategory(payload: { name: string; description?: string; status?: string }) {
  const convertedPayload = toInsert(payload);
  const { data, error } = await supabase
    .from("categories")
    .insert(convertedPayload)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateCategory({ id, payload }: { id: string; payload: { name?: string; description?: string; status?: string } }) {
  const convertedPayload = toUpdate(payload);
  const { data, error } = await supabase
    .from("categories")
    .update(convertedPayload)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export function usePaginatedCategories(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories-paginated", page],
    queryFn: () => fetchPaginatedCategories(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      toast.success("Categoria eliminada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["categories-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar categoria"),
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      toast.success("Categoria criada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["categories-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar categoria"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: async () => {
      toast.success("Categoria atualizada com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["categories-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar categoria"),
  });

  return {
    categories: query.data?.categories || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteCategory: deleteMutation.mutate,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
  };
}
