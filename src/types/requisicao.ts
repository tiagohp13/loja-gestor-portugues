export interface Requisicao {
  id: string;
  numero: string;
  fornecedorId: string | null;
  fornecedorNome: string;
  data: Date;
  estado: 'encomendado' | 'cancelado' | 'concluido';
  observacoes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items?: RequisicaoItem[];
}

export interface RequisicaoItem {
  id: string;
  requisicaoId: string;
  produtoId: string | null;
  produtoNome: string;
  quantidade: number;
  stockAtual: number;
  stockMinimo: number;
  origem: 'stock_baixo' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRequisicaoInput {
  fornecedorId: string;
  fornecedorNome: string;
  observacoes?: string;
  items: Array<{
    produtoId: string;
    produtoNome: string;
    quantidade: number;
    stockAtual: number;
    stockMinimo: number;
    origem: 'stock_baixo' | 'manual';
  }>;
}
