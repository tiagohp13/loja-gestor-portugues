-- Adicionar campo para ligar requisições a compras
ALTER TABLE requisicoes 
ADD COLUMN IF NOT EXISTS stock_entry_id uuid REFERENCES stock_entries(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_requisicoes_stock_entry_id ON requisicoes(stock_entry_id);

-- Função para reverter estado da requisição quando compra é eliminada
CREATE OR REPLACE FUNCTION revert_requisicao_on_compra_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Se uma compra for soft deleted, reverter requisições associadas para "encomendado"
  UPDATE requisicoes 
  SET estado = 'encomendado',
      updated_at = now()
  WHERE stock_entry_id = OLD.id 
    AND estado = 'concluido'
    AND deleted_at IS NULL;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para soft delete
CREATE OR REPLACE TRIGGER trigger_revert_requisicao_on_soft_delete
BEFORE UPDATE OF deleted_at ON stock_entries
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION revert_requisicao_on_compra_delete();

-- Criar trigger para hard delete
CREATE OR REPLACE TRIGGER trigger_revert_requisicao_on_hard_delete
BEFORE DELETE ON stock_entries
FOR EACH ROW
EXECUTE FUNCTION revert_requisicao_on_compra_delete();