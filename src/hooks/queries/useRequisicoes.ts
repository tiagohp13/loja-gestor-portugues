import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Requisicao, CreateRequisicaoInput } from "@/types/requisicao";

// -------------------------------
// 🔹 Fetch all requisições with items (optimized - no N+1 queries)
// -------------------------------
async function fetchRequisicoes(): Promise<Requisicao[]> {
  // Fetch all requisições
  const { data: requisicoes, error } = await supabase
    .from("requisicoes")
    .select("*")
    .is("deleted_at", null)
    .order("data", { ascending: false });

  if (error) throw error;
  if (!requisicoes || requisicoes.length === 0) return [];

  // Fetch ALL items in a single query (no N+1!)
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
  return requisicoes.map(req => ({
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
}

// -------------------------------
// 🔹 Create requisição with automatic number generation
// -------------------------------
async function createRequisicao(input: CreateRequisicaoInput): Promise<Requisicao> {
  const currentYear = new Date().getFullYear();

  // ✅ Corrigido: parâmetros compatíveis com função do Supabase
 const { data: counterData, error: counterError } = await supabase.rpc("get_next_counter_by_year", {
  counter_type: "requisicoes",
  p_year: currentYear,
});

  if (counterError) throw counterError;

  // Garantir que o contador é válido e nunca dá NaN
  let nextNumber = typeof counterData === 'number' ? counterData : (parseInt(String(counterData ?? "1"), 10) || 1);
  let numero = `REQ-${currentYear}/${String(nextNumber).padStart(3, "0")}`;

  // Verificar se o número já existe e incrementar até encontrar um disponível
  let exists = true;
  while (exists) {
    const { data: existingReq, error: checkError } = await supabase
      .from("requisicoes")
      .select("id")
      .eq("numero", numero)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingReq) {
      // Número já existe, incrementar
      nextNumber++;
      numero = `REQ-${currentYear}/${String(nextNumber).padStart(3, "0")}`;
    } else {
      // Número disponível
      exists = false;
    }
  }

  // Create requisição
  const { data: requisicao, error: reqError } = await supabase
    .from("requisicoes")
    .insert({
      numero,
      fornecedor_id: input.fornecedorId,
      fornecedor_nome: input.fornecedorNome,
      observacoes: input.observacoes || null,
      estado: "encomendado",
    })
    .select()
    .single();

  if (reqError) throw reqError;

  // Create items
  const { error: itemsError } = await supabase.from("requisicao_itens").insert(
    input.items.map((item) => ({
      requisicao_id: requisicao.id,
      produto_id: item.produtoId,
      produto_nome: item.produtoNome,
      quantidade: item.quantidade,
      preco: item.preco || 0,
      stock_atual: item.stockAtual,
      stock_minimo: item.stockMinimo,
      origem: item.origem,
    })),
  );

  if (itemsError) throw itemsError;

  return {
    id: requisicao.id,
    numero: requisicao.numero,
    fornecedorId: requisicao.fornecedor_id,
    fornecedorNome: requisicao.fornecedor_nome,
    data: new Date(requisicao.data),
    estado: requisicao.estado as "encomendado" | "cancelado" | "concluido",
    observacoes: requisicao.observacoes,
    userId: requisicao.user_id,
    createdAt: new Date(requisicao.created_at),
    updatedAt: new Date(requisicao.updated_at),
    items: input.items.map((item) => ({
      id: "",
      requisicaoId: requisicao.id,
      produtoId: item.produtoId,
      produtoNome: item.produtoNome,
      quantidade: item.quantidade,
      preco: item.preco || 0,
      stockAtual: item.stockAtual,
      stockMinimo: item.stockMinimo,
      origem: item.origem,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
}

// -------------------------------
// 🔹 Update requisição state and create stock entry when completing
// -------------------------------
async function updateRequisicaoEstado(id: string, estado: "encomendado" | "cancelado" | "concluido"): Promise<void> {
  const { error } = await supabase
    .from("requisicoes")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;

  // Note: Stock entry creation is now handled in the frontend
  // to avoid issues with automatic stock updates and provide better UX
}

// -------------------------------
// 🔹 Delete requisição (soft delete)
// -------------------------------
async function deleteRequisicao(id: string): Promise<void> {
  const { error } = await supabase.from("requisicoes").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  if (error) throw error;
}

// -------------------------------
// 🔹 Hook principal
// -------------------------------
export function useRequisicoesQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["requisicoes"],
    queryFn: fetchRequisicoes,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createRequisicao,
    onSuccess: () => {
      toast.success("Requisição criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["requisicoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar requisição"),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: "encomendado" | "cancelado" | "concluido" }) =>
      updateRequisicaoEstado(id, estado),
    onSuccess: () => {
      toast.success("Estado atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["requisicoes"] });
      // Also invalidate stock entries and products when completing a requisition (creates stock entry)
      queryClient.invalidateQueries({ queryKey: ["stock-entries"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar estado"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequisicao,
    onSuccess: () => {
      toast.success("Requisição eliminada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["requisicoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-optimized"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao eliminar requisição"),
  });

  return {
    requisicoes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createRequisicao: createMutation.mutate,
    updateEstado: updateEstadoMutation.mutate,
    deleteRequisicao: deleteMutation.mutate,
  };
}
