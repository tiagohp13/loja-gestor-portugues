import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Requisicao, CreateRequisicaoInput } from "@/types/requisicao";

// -------------------------------
// 🔹 Fetch all requisições with items
// -------------------------------
async function fetchRequisicoes(): Promise<Requisicao[]> {
  const { data: requisicoes, error } = await supabase
    .from("requisicoes")
    .select("*")
    .is("deleted_at", null)
    .order("data", { ascending: false });

  if (error) throw error;

  // Fetch items for each requisição
  const requisicoesWithItems = await Promise.all(
    (requisicoes || []).map(async (req) => {
      const { data: items, error: itemsError } = await supabase
        .from("requisicao_itens")
        .select("*")
        .eq("requisicao_id", req.id);

      if (itemsError) throw itemsError;

      return {
        id: req.id,
        numero: req.numero,
        fornecedorId: req.fornecedor_id,
        fornecedorNome: req.fornecedor_nome,
        data: new Date(req.data),
        estado: req.estado as "encomendado" | "cancelado" | "concluido",
        observacoes: req.observacoes,
        userId: req.user_id,
        createdAt: new Date(req.created_at),
        updatedAt: new Date(req.updated_at),
        items: (items || []).map((item) => ({
          id: item.id,
          requisicaoId: item.requisicao_id,
          produtoId: item.produto_id,
          produtoNome: item.produto_nome,
          quantidade: item.quantidade,
          stockAtual: item.stock_atual,
          stockMinimo: item.stock_minimo,
          origem: item.origem as "stock_baixo" | "manual",
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        })),
      };
    }),
  );

  return requisicoesWithItems;
}

// -------------------------------
// 🔹 Create requisição with automatic number generation
// -------------------------------
async function createRequisicao(input: CreateRequisicaoInput): Promise<Requisicao> {
  const currentYear = new Date().getFullYear();

  // ✅ Corrigido: parâmetros compatíveis com função do Supabase
  const { data: counterData, error: counterError } = await supabase.rpc("get_next_counter_by_year" as any, {
    p_counter_type: "requisicoes",
    p_year_input: currentYear as any,
  });

  if (counterError) throw counterError;

  const nextNumber = parseInt(counterData, 10);
  const numero = `REQ-${currentYear}/${String(nextNumber).padStart(3, "0")}`;

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

  // If completing requisição, create stock entry automatically
  if (estado === "concluido") {
    const { data: req, error: reqError } = await supabase
      .from("requisicoes")
      .select("*, requisicao_itens(*)")
      .eq("id", id)
      .single();

    if (reqError) throw reqError;

    const currentYear = new Date().getFullYear();

    // ✅ Corrigido: parâmetros compatíveis com função do Supabase
    const { data: counterData, error: counterError } = await supabase.rpc("get_next_counter_by_year" as any, {
      p_counter_type: "stock_entries",
      p_year_input: currentYear as any,
    });

    if (counterError) throw counterError;

    const nextNumber = parseInt(counterData, 10);
    const numero = `ENT-${currentYear}/${String(nextNumber).padStart(3, "0")}`;

    // Create stock entry
    const { data: entry, error: entryError } = await supabase
      .from("stock_entries")
      .insert({
        number: numero,
        supplier_id: req.fornecedor_id,
        supplier_name: req.fornecedor_nome,
        notes: `Entrada automática da requisição ${req.numero}`,
        date: new Date().toISOString(),
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // Create stock entry items and update product stock
    for (const item of req.requisicao_itens) {
      await supabase.from("stock_entry_items").insert({
        entry_id: entry.id,
        product_id: item.produto_id,
        product_name: item.produto_nome,
        quantity: item.quantidade,
        purchase_price: 0, // Price can be updated later
      });

      // Update product stock
      if (item.produto_id) {
        const { data: product } = await supabase
          .from("products")
          .select("current_stock")
          .eq("id", item.produto_id)
          .single();

        if (product) {
          await supabase
            .from("products")
            .update({
              current_stock: product.current_stock + item.quantidade,
            })
            .eq("id", item.produto_id);
        }
      }
    }
  }
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
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar requisição"),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: "encomendado" | "cancelado" | "concluido" }) =>
      updateRequisicaoEstado(id, estado),
    onSuccess: () => {
      toast.success("Estado atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["requisicoes"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar estado"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequisicao,
    onSuccess: () => {
      toast.success("Requisição eliminada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["requisicoes"] });
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
