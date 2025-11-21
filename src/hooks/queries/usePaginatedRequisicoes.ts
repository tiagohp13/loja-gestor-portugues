import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Requisicao } from "@/types/requisicao";

const PAGE_SIZE = 25;

async function fetchPaginatedRequisicoes(page: number = 0): Promise<{ requisicoes: Requisicao[]; totalCount: number }> {
  // Get total count
  const { count } = await supabase
    .from("requisicoes")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  // Fetch requisições for current page
  const { data: requisicoes, error } = await supabase
    .from("requisicoes")
    .select("*")
    .is("deleted_at", null)
    .order("data", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (error) throw error;
  if (!requisicoes || requisicoes.length === 0) {
    return { requisicoes: [], totalCount: count || 0 };
  }

  // Fetch ALL items for these requisições in a single query
  const requisicaoIds = requisicoes.map(r => r.id);
  const { data: allItems, error: itemsError } = await supabase
    .from("requisicao_itens")
    .select("*")
    .in("requisicao_id", requisicaoIds);

  if (itemsError) throw itemsError;

  // Group items by requisicao_id
  const itemsByRequisicao = (allItems || []).reduce((acc, item) => {
    if (!acc[item.requisicao_id]) {
      acc[item.requisicao_id] = [];
    }
    acc[item.requisicao_id].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Map requisições with their items
  const requisicoesWithItems = requisicoes.map(req => ({
    id: req.id,
    numero: req.numero,
    fornecedorId: req.fornecedor_id,
    fornecedorNome: req.fornecedor_nome,
    data: new Date(req.data),
    estado: req.estado as "encomendado" | "cancelado" | "concluido",
    observacoes: req.observacoes,
    stockEntryId: req.stock_entry_id,
    userId: req.user_id,
    createdAt: new Date(req.created_at),
    updatedAt: new Date(req.updated_at),
    items: (itemsByRequisicao[req.id] || []).map((item) => ({
      id: item.id,
      requisicaoId: item.requisicao_id,
      produtoId: item.produto_id,
      produtoNome: item.produto_nome,
      quantidade: item.quantidade,
      preco: item.preco || 0,
      stockAtual: item.stock_atual,
      stockMinimo: item.stock_minimo,
      origem: item.origem as "stock_baixo" | "manual",
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    })),
  }));

  return {
    requisicoes: requisicoesWithItems,
    totalCount: count || 0,
  };
}

async function deleteRequisicao(id: string): Promise<void> {
  const { error } = await supabase
    .from("requisicoes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

async function updateRequisicaoEstado(id: string, estado: "encomendado" | "cancelado" | "concluido"): Promise<void> {
  const { error } = await supabase
    .from("requisicoes")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export function usePaginatedRequisicoes(page: number = 0) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["requisicoes-paginated", page],
    queryFn: () => fetchPaginatedRequisicoes(page),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: "encomendado" | "cancelado" | "concluido" }) =>
      updateRequisicaoEstado(id, estado),
    onSuccess: () => {
      toast.success("Estado atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["requisicoes-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["requisicoes"] });
      queryClient.invalidateQueries({ queryKey: ["stock-entries"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar estado"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequisicao,
    onSuccess: () => {
      toast.success("Requisição eliminada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["requisicoes-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["requisicoes"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar requisição"),
  });

  return {
    requisicoes: query.data?.requisicoes || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: Math.ceil((query.data?.totalCount || 0) / PAGE_SIZE),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateEstado: updateEstadoMutation.mutate,
    deleteRequisicao: deleteMutation.mutate,
  };
}
