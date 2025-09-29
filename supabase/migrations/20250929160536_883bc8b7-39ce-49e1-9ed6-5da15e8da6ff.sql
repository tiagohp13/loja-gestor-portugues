-- FASE 2: MIGRAÇÃO GRADUAL - PRIMEIRO REMOVER DEPENDÊNCIAS

-- Remover policies dependentes das tabelas legacy
DROP POLICY IF EXISTS "Users can delete their own order items" ON "EncomendasItems";
DROP POLICY IF EXISTS "Users can insert their own order items" ON "EncomendasItems";
DROP POLICY IF EXISTS "Users can update their own order items" ON "EncomendasItems";
DROP POLICY IF EXISTS "Users can view their own order items" ON "EncomendasItems";

-- Remover constraints FK específicas
ALTER TABLE IF EXISTS "EncomendasItems" DROP CONSTRAINT IF EXISTS "EncomendasItems_encomendaid_fkey";

-- Agora remover as tabelas legacy com CASCADE
DROP TABLE IF EXISTS "EncomendasItems" CASCADE;
DROP TABLE IF EXISTS "Encomendas" CASCADE;
DROP TABLE IF EXISTS "StockEntriesItems" CASCADE;
DROP TABLE IF EXISTS "StockEntries" CASCADE;
DROP TABLE IF EXISTS "StockExitsItems" CASCADE;
DROP TABLE IF EXISTS "StockExits" CASCADE;
DROP TABLE IF EXISTS "Produtos" CASCADE;
DROP TABLE IF EXISTS "Clientes" CASCADE;

-- Limpar tabela de profiles não utilizada
DROP TABLE IF EXISTS profiles CASCADE;