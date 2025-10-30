import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "@/types";
import { mapCategory } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("name");
  
  if (error) throw error;
  return (data || []).map(mapCategory);
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

async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  
  if (error) throw error;
  return data ? mapCategory(data) : null;
}

export function useCategoriesQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes - aggressive caching for dashboard performance
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Categoria eliminada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar categoria"),
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Categoria criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar categoria"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar categoria"),
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteCategory: deleteMutation.mutate,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
  };
}

export function useCategoryQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
