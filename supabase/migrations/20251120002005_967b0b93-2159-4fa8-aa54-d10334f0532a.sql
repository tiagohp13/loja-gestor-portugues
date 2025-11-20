-- Adicionar campo de preço aos itens de requisição
ALTER TABLE requisicao_itens 
ADD COLUMN IF NOT EXISTS preco numeric DEFAULT 0;