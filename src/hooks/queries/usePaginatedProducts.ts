import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types";
import { mapProduct } from "./mappers";
import { toInsert, toUpdate } from "@/integrations/supabase/utils/mutation";

const PAGE_SIZE = 25;

async function fetchPaginatedProducts(page: number = 0): Promise<{ products: Product[]; totalCount: number }> {
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .order("code", { ascending: true })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  
  if (error) throw error;
  
  // Apply natural sort for numeric codes within the page
  const products = (data || []).map(mapProduct).sort((a, b) => {
    const aNum = parseInt(a.code);
    const bNum = parseInt(b.code);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
  });
  
  return {
    products,
    totalCount: count || 0,
  };
}

async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) throw error;
  return id;
}

async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  const payload = toInsert(product);
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateProduct({ id, ...updates }: Partial<Product> & { id: string }) {
  const payload = toUpdate(updates);
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export function usePaginatedProducts(page: number = 0) {
  const queryClient = useQueryClient();

  // TODO (Copilot): Adicionar refetchOnMount: "always" neste useQuery,
  // porque o QueryClient global tem refetchOnMount desativado.
  // Sem isto, a lista de produtos não atualiza ao voltar da página.
  const query = useQuery({
    queryKey: ["products-paginated", page],
    queryFn: () => fetchPaginatedProducts(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: true,
  });

  // TODO (Copilot): Após criar, editar ou apagar um produto, 
  // adiciona sempre:
  // await queryClient.invalidateQueries({ queryKey: ["products-paginated"] });
  // a seguir aos invalidates já existentes.
  // Isto garante que a lista paginada de produtos atualiza imediatamente.
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      toast.success("Produto eliminado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["products-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar produto"),
  });

  // TODO (Copilot): Após criar, editar ou apagar um produto, 
  // adiciona sempre:
  // await queryClient.invalidateQueries({ queryKey: ["products-paginated"] });
  // a seguir aos invalidates já existentes.
  // Isto garante que a lista paginada de produtos atualiza imediatamente.
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      toast.success("Produto criado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["products-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar produto"),
  });

  // TODO (Copilot): Após criar, editar ou apagar um produto, 
  // adiciona sempre:
  // await queryClient.invalidateQueries({ queryKey: ["products-paginated"] });
  // a seguir aos invalidates já existentes.
  // Isto garante que a lista paginada de produtos atualiza imediatamente.
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: async () => {
      toast.success("Produto atualizado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["products-paginated"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar produto"),
  });

  return {
    products: query.data?.products || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    deleteProduct: deleteMutation.mutate,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
  };
}