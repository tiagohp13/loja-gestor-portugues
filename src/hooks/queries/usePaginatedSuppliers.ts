import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Supplier } from "@/types";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { mapSupplier } from "./mappers";

const PAGE_SIZE = 25;

async function fetchPaginatedSuppliers(page: number = 0): Promise<{ suppliers: Supplier[]; totalCount: number }> {
  const { count } = await supabase
    .from("suppliers")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .is("deleted_at", null)
    .order("name")
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  
  if (error) throw error;
  return {
    suppliers: (data || []).map(mapSupplier),
    totalCount: count || 0,
  };
}

async function deleteSupplier(id: string) {
  const { error } = await supabase
    .from("suppliers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

async function createSupplier(supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) {
  const payload = toInsert(supplier);
  const { data, error } = await supabase
    .from("suppliers")
    .insert(payload)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateSupplier({ id, ...updates }: Partial<Supplier> & { id: string }) {
  const payload = toUpdate(updates);
  const { data, error } = await supabase
    .from("suppliers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export function usePaginatedSuppliers(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["suppliers-paginated", page],
    queryFn: () => fetchPaginatedSuppliers(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: async () => {
      toast.success("Fornecedor eliminado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["suppliers-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar fornecedor"),
  });

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: async () => {
      toast.success("Fornecedor criado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["suppliers-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar fornecedor"),
  });

  const updateMutation = useMutation({
    mutationFn: updateSupplier,
    onSuccess: async () => {
      toast.success("Fornecedor atualizado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["suppliers-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar fornecedor"),
  });

  return {
    suppliers: query.data?.suppliers || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteSupplier: deleteMutation.mutate,
    createSupplier: createMutation.mutate,
    updateSupplier: updateMutation.mutate,
  };
}
