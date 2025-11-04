-- Criar tabela de requisições
CREATE TABLE IF NOT EXISTS public.requisicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  fornecedor_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  fornecedor_nome TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'encomendado' CHECK (estado IN ('encomendado', 'cancelado', 'concluido')),
  observacoes TEXT,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de itens de requisição
CREATE TABLE IF NOT EXISTS public.requisicao_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisicao_id UUID NOT NULL REFERENCES public.requisicoes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  stock_atual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  origem TEXT NOT NULL DEFAULT 'manual' CHECK (origem IN ('stock_baixo', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar contador para numeração de requisições
INSERT INTO public.counters (id, year, current_count)
VALUES ('requisicoes', EXTRACT(YEAR FROM NOW())::INTEGER, 0)
ON CONFLICT (id, year) DO NOTHING;

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_requisicoes_user_id ON public.requisicoes(user_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_fornecedor_id ON public.requisicoes(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_estado ON public.requisicoes(estado);
CREATE INDEX IF NOT EXISTS idx_requisicoes_deleted_at ON public.requisicoes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_requisicao_itens_requisicao_id ON public.requisicao_itens(requisicao_id);
CREATE INDEX IF NOT EXISTS idx_requisicao_itens_produto_id ON public.requisicao_itens(produto_id);

-- RLS Policies para requisicoes
ALTER TABLE public.requisicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requisições"
  ON public.requisicoes FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own requisições"
  ON public.requisicoes FOR INSERT
  WITH CHECK (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Users can update their own requisições"
  ON public.requisicoes FOR UPDATE
  USING (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Only admin can delete requisições"
  ON public.requisicoes FOR DELETE
  USING (can_delete_data());

-- RLS Policies para requisicao_itens
ALTER TABLE public.requisicao_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items from their requisições"
  ON public.requisicao_itens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requisicoes
      WHERE requisicoes.id = requisicao_itens.requisicao_id
      AND (requisicoes.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Users can create items for their requisições"
  ON public.requisicao_itens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requisicoes
      WHERE requisicoes.id = requisicao_itens.requisicao_id
      AND requisicoes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items from their requisições"
  ON public.requisicao_itens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.requisicoes
      WHERE requisicoes.id = requisicao_itens.requisicao_id
      AND requisicoes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their requisições"
  ON public.requisicao_itens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.requisicoes
      WHERE requisicoes.id = requisicao_itens.requisicao_id
      AND requisicoes.user_id = auth.uid()
    )
  );