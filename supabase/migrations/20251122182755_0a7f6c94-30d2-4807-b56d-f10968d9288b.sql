
-- ============================================
-- Atualizar RLS Policies para filtrar por tenant_id
-- ============================================

-- PRODUCTS: Filtrar por tenant
DROP POLICY IF EXISTS "products_read_all" ON products;
CREATE POLICY "products_read_tenant" ON products
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() 
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admin and editor can insert products" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
CREATE POLICY "products_insert_tenant" ON products
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "Admin and editor can update products" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
CREATE POLICY "products_update_tenant" ON products
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- CLIENTS: Filtrar por tenant
DROP POLICY IF EXISTS "clients_read_all" ON clients;
CREATE POLICY "clients_read_tenant" ON clients
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "clients_insert" ON clients;
CREATE POLICY "clients_insert_tenant" ON clients
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "clients_update" ON clients;
CREATE POLICY "clients_update_tenant" ON clients
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- SUPPLIERS: Filtrar por tenant
DROP POLICY IF EXISTS "suppliers_read_all" ON suppliers;
CREATE POLICY "suppliers_read_tenant" ON suppliers
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "suppliers_insert_own_data_only" ON suppliers;
CREATE POLICY "suppliers_insert_tenant" ON suppliers
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "suppliers_update_own_data_only" ON suppliers;
CREATE POLICY "suppliers_update_tenant" ON suppliers
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- CATEGORIES: Filtrar por tenant
DROP POLICY IF EXISTS "categories_read_all" ON categories;
CREATE POLICY "categories_read_tenant" ON categories
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "categories_insert" ON categories;
CREATE POLICY "categories_insert_tenant" ON categories
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "categories_update" ON categories;
CREATE POLICY "categories_update_tenant" ON categories
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- ORDERS: Filtrar por tenant
DROP POLICY IF EXISTS "orders_read_all" ON orders;
CREATE POLICY "orders_read_tenant" ON orders
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admin and editor can insert orders" ON orders;
CREATE POLICY "orders_insert_tenant" ON orders
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "Admin and editor can update orders" ON orders;
CREATE POLICY "orders_update_tenant" ON orders
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- STOCK_ENTRIES: Filtrar por tenant
DROP POLICY IF EXISTS "stock_entries_read_all" ON stock_entries;
CREATE POLICY "stock_entries_read_tenant" ON stock_entries
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admin and editor can insert stock_entries" ON stock_entries;
CREATE POLICY "stock_entries_insert_tenant" ON stock_entries
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "Admin and editor can update stock_entries" ON stock_entries;
CREATE POLICY "stock_entries_update_tenant" ON stock_entries
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- STOCK_EXITS: Filtrar por tenant
DROP POLICY IF EXISTS "stock_exits_read_all" ON stock_exits;
CREATE POLICY "stock_exits_read_tenant" ON stock_exits
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admin and editor can insert stock_exits" ON stock_exits;
CREATE POLICY "stock_exits_insert_tenant" ON stock_exits
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "Admin and editor can update stock_exits" ON stock_exits;
CREATE POLICY "stock_exits_update_tenant" ON stock_exits
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- EXPENSES: Filtrar por tenant
DROP POLICY IF EXISTS "expenses_read_all" ON expenses;
CREATE POLICY "expenses_read_tenant" ON expenses
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admin and editor can insert expenses" ON expenses;
CREATE POLICY "expenses_insert_tenant" ON expenses
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "Admin and editor can update expenses" ON expenses;
CREATE POLICY "expenses_update_tenant" ON expenses
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );

-- REQUISICOES: Filtrar por tenant
DROP POLICY IF EXISTS "requisicoes_read_all" ON requisicoes;
CREATE POLICY "requisicoes_read_tenant" ON requisicoes
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can create their own requisições" ON requisicoes;
CREATE POLICY "requisicoes_insert_tenant" ON requisicoes
  FOR INSERT
  WITH CHECK (
    (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
    AND can_write_data()
  );

DROP POLICY IF EXISTS "Users can update their own requisições" ON requisicoes;
CREATE POLICY "requisicoes_update_tenant" ON requisicoes
  FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND can_write_data()
  );
