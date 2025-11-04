// -------------------------------
// 🔹 Create requisição with automatic number generation
// -------------------------------
async function createRequisicao(input: CreateRequisicaoInput): Promise<Requisicao> {
  const currentYear = new Date().getFullYear();

  // ✅ Buscar contador base
  const { data: counterData, error: counterError } = await supabase.rpc("get_next_counter_by_year" as any, {
    p_counter_type: "requisicoes",
    p_year_input: currentYear as any,
  });

  if (counterError) throw counterError;

  let nextNumber = parseInt(counterData, 10);
  let numero = `REQ-${currentYear}/${String(nextNumber).padStart(3, "0")}`;

  // ✅ Garantir número único — se já existir, incrementa
  let exists = true;
  while (exists) {
    const { data: existing } = await supabase.from("requisicoes").select("id").eq("numero", numero).maybeSingle();

    if (existing) {
      nextNumber++;
      numero = `REQ-${currentYear}/${String(nextNumber).padStart(3, "0")}`;
    } else {
      exists = false;
    }
  }

  // ✅ Criar requisição
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

  // ✅ Criar itens associados
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
