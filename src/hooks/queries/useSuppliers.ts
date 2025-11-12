import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Supplier } from "@/types";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";
import { mapSupplier } from "./mappers";

async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, email, phone, address, tax_id, payment_terms, notes, status, user_id, created_at, updated_at, deleted_at")
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

export function useSuppliersQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: async () => {
      toast.success("Fornecedor eliminado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar fornecedor"),
  });

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: async () => {
      toast.success("Fornecedor criado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar fornecedor"),
  });

  const updateMutation = useMutation({
    mutationFn: updateSupplier,
    onSuccess: async () => {
      toast.success("Fornecedor atualizado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
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
