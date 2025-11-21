-- 1) Create or replace unified read helper
CREATE OR REPLACE FUNCTION public.can_read_data(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Any authenticated user can read data
  RETURN auth.role() = 'authenticated';
END;
$$;

-- 2) Update SELECT RLS policies to use can_read_data() for requested ERP tables

-- CATEGORIES -------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "Select: authenticated" ON public.categories;

CREATE POLICY "categories_read_all"
ON public.categories
FOR SELECT
USING (public.can_read_data());

-- CLIENTS ----------------------------------------------------------------
DROP POLICY IF EXISTS "Secure client access - users see own data only" ON public.clients;
DROP POLICY IF EXISTS "clients_select" ON public.clients;

CREATE POLICY "clients_read_all"
ON public.clients
FOR SELECT
USING (public.can_read_data());

-- SUPPLIERS --------------------------------------------------------------
DROP POLICY IF EXISTS "suppliers_select_own_data_only" ON public.suppliers;

CREATE POLICY "suppliers_read_all"
ON public.suppliers
FOR SELECT
USING (public.can_read_data());

-- PRODUCTS ---------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view products" ON public.products;

CREATE POLICY "products_read_all"
ON public.products
FOR SELECT
USING (public.can_read_data());

-- ORDERS -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;

CREATE POLICY "orders_read_all"
ON public.orders
FOR SELECT
USING (public.can_read_data());

-- STOCK ENTRIES ----------------------------------------------------------
DROP POLICY IF EXISTS "Secure stock entry access - own data only" ON public.stock_entries;

CREATE POLICY "stock_entries_read_all"
ON public.stock_entries
FOR SELECT
USING (public.can_read_data());

-- STOCK ENTRY ITEMS ------------------------------------------------------
DROP POLICY IF EXISTS "Allow owners to read stock_entry_items" ON public.stock_entry_items;

CREATE POLICY "stock_entry_items_read_all"
ON public.stock_entry_items
FOR SELECT
USING (public.can_read_data());

-- STOCK EXITS ------------------------------------------------------------
DROP POLICY IF EXISTS "Secure stock exit access - own data only" ON public.stock_exits;

CREATE POLICY "stock_exits_read_all"
ON public.stock_exits
FOR SELECT
USING (public.can_read_data());

-- STOCK EXIT ITEMS -------------------------------------------------------
DROP POLICY IF EXISTS "Allow owners to read stock_exit_items" ON public.stock_exit_items;

CREATE POLICY "stock_exit_items_read_all"
ON public.stock_exit_items
FOR SELECT
USING (public.can_read_data());

-- EXPENSES ---------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;

CREATE POLICY "expenses_read_all"
ON public.expenses
FOR SELECT
USING (public.can_read_data());

-- REQUISICOES ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own requisições" ON public.requisicoes;

CREATE POLICY "requisicoes_read_all"
ON public.requisicoes
FOR SELECT
USING (public.can_read_data());

-- REQUISICAO_ITENS -------------------------------------------------------
DROP POLICY IF EXISTS "Users can view items from their requisições" ON public.requisicao_itens;

CREATE POLICY "requisicao_itens_read_all"
ON public.requisicao_itens
FOR SELECT
USING (public.can_read_data());