import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types";
import { mapProduct } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .order("reference", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapProduct);
}

async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  if (error) throw error;
  return id;
}

async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  const payload = toInsert(product);
  const { data, error } = await supabase.from("products").insert(payload).select().single();

  if (error) throw error;
  return data;
}

async function updateProduct({ id, ...updates }: Partial<Product> & { id: string }) {
  const payload = toUpdate(updates);
  const { data, error } = await supabase.from("products").update(payload).eq("id", id).select().single();

  if (error) throw error;
  return data;
}

async function getProductById(id: string) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).is("deleted_at", null).single();

  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export function useProductsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      toast.success("Produto eliminado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar produto"),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      toast.success("Produto criado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar produto"),
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: async () => {
      toast.success("Produto atualizado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar produto"),
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteProduct: deleteMutation.mutate,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
  };
}

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
