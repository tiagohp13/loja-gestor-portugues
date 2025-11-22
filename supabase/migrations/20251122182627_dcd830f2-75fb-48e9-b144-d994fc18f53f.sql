
-- ============================================
-- FASE 4: Adicionar tenant_id às tabelas principais
-- ============================================

-- 1. Adicionar coluna tenant_id às tabelas principais
ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE stock_entries ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE stock_exits ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE requisicoes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 2. Popular tenant_id com base no tenant atual de cada user_id
UPDATE products p
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = p.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE clients c
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = c.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE suppliers s
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = s.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE categories cat
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = cat.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE orders o
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = o.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE stock_entries se
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = se.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE stock_exits sx
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = sx.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE expenses e
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = e.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

UPDATE requisicoes r
SET tenant_id = (
  SELECT tu.tenant_id 
  FROM tenant_users tu 
  WHERE tu.user_id = r.user_id 
  AND tu.status = 'active'
  LIMIT 1
)
WHERE tenant_id IS NULL AND user_id IS NOT NULL;

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_tenant_id ON stock_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_exits_tenant_id ON stock_exits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_tenant_id ON requisicoes(tenant_id);

-- 4. Criar função helper para obter tenant do contexto atual
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_tenant UUID;
BEGIN
  -- Super admins usam o tenant do contexto
  IF is_super_admin(auth.uid()) THEN
    RETURN get_current_tenant_id(auth.uid());
  END IF;
  
  -- Usuários normais usam o tenant do contexto
  RETURN get_current_tenant_id(auth.uid());
END;
$$;

-- 5. Criar triggers para auto-popular tenant_id em novos registros
CREATE OR REPLACE FUNCTION set_tenant_id_from_context()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_user_tenant_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar triggers em todas as tabelas
DROP TRIGGER IF EXISTS set_products_tenant_id ON products;
CREATE TRIGGER set_products_tenant_id
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_clients_tenant_id ON clients;
CREATE TRIGGER set_clients_tenant_id
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_suppliers_tenant_id ON suppliers;
CREATE TRIGGER set_suppliers_tenant_id
  BEFORE INSERT ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_categories_tenant_id ON categories;
CREATE TRIGGER set_categories_tenant_id
  BEFORE INSERT ON categories
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_orders_tenant_id ON orders;
CREATE TRIGGER set_orders_tenant_id
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_stock_entries_tenant_id ON stock_entries;
CREATE TRIGGER set_stock_entries_tenant_id
  BEFORE INSERT ON stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_stock_exits_tenant_id ON stock_exits;
CREATE TRIGGER set_stock_exits_tenant_id
  BEFORE INSERT ON stock_exits
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_expenses_tenant_id ON expenses;
CREATE TRIGGER set_expenses_tenant_id
  BEFORE INSERT ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();

DROP TRIGGER IF EXISTS set_requisicoes_tenant_id ON requisicoes;
CREATE TRIGGER set_requisicoes_tenant_id
  BEFORE INSERT ON requisicoes
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_from_context();
