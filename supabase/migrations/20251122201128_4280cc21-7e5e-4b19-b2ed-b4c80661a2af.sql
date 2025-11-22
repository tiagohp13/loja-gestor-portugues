-- Adicionar novas colunas à tabela tenants para informação da organização
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS industry_sector TEXT;

-- Adicionar índice para tax_id para pesquisas rápidas
CREATE INDEX IF NOT EXISTS idx_tenants_tax_id ON tenants(tax_id) WHERE tax_id IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN tenants.tax_id IS 'NIF da organização (obrigatório para planos Basic e Premium)';
COMMENT ON COLUMN tenants.phone IS 'Telefone de contacto da organização';
COMMENT ON COLUMN tenants.website IS 'Website da organização';
COMMENT ON COLUMN tenants.industry_sector IS 'Setor de atividade da organização';