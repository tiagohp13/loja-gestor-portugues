import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Supplier } from "@/types";
import { mapSupplier } from "./mappers";

async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .is("deleted_at", null)
    .order("name");
  
  if (error) throw error;
  return (data || []).map(mapSupplier);
}

async function deleteSupplier(id: string) {
  const { error } = await supabase
    .from("suppliers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

async function createSupplier(supplier: Omit<Supplier, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(supplier)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateSupplier({ id, ...updates }: Partial<Supplier> & { id: string }) {
  const { data, error } = await supabase
    .from("suppliers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export function useSuppliersQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 10, // 10 minutes - aggressive caching for dashboard performance
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      toast.success("Fornecedor eliminado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar fornecedor"),
  });

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      toast.success("Fornecedor criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar fornecedor"),
  });

  const updateMutation = useMutation({
    mutationFn: updateSupplier,
    onSuccess: () => {
      toast.success("Fornecedor atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar fornecedor"),
  });

  return {
    suppliers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteSupplier: deleteMutation.mutate,
    createSupplier: createMutation.mutate,
    updateSupplier: updateMutation.mutate,
  };
}
