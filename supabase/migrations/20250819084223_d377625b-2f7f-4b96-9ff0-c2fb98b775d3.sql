-- Phase 1: Remove anonymous access and fix critical security vulnerabilities

-- 1. Drop all anonymous access policies from Clientes table
DROP POLICY IF EXISTS "Allow anonymous delete on Clientes" ON "Clientes";
DROP POLICY IF EXISTS "Allow anonymous inserts on Clientes" ON "Clientes"; 
DROP POLICY IF EXISTS "Allow anonymous select on Clientes" ON "Clientes";
DROP POLICY IF EXISTS "Allow anonymous update on Clientes" ON "Clientes";

-- 2. Drop anonymous access policies from legacy order tables
DROP POLICY IF EXISTS "Allow anonymous operations on Encomendas" ON "Encomendas";
DROP POLICY IF EXISTS "Allow anonymous operations on EncomendasItems" ON "EncomendasItems";
DROP POLICY IF EXISTS "Allow anonymous operations on StockEntries" ON "StockEntries";
DROP POLICY IF EXISTS "Allow anonymous operations on StockEntriesItems" ON "StockEntriesItems";
DROP POLICY IF EXISTS "Allow anonymous operations on StockExits" ON "StockExits";
DROP POLICY IF EXISTS "Allow anonymous operations on StockExitsItems" ON "StockExitsItems";

-- 3. Add user_id columns to legacy tables for proper isolation
ALTER TABLE "Clientes" ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE "Encomendas" ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE "StockEntries" ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE "StockExits" ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

-- 4. Create secure RLS policies for Clientes table
CREATE POLICY "Users can view their own clients" ON "Clientes"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON "Clientes"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON "Clientes"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Only admin can delete clients" ON "Clientes"
  FOR DELETE USING (can_delete_data());

-- 5. Create secure RLS policies for legacy order tables
CREATE POLICY "Users can view their own orders" ON "Encomendas"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON "Encomendas"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON "Encomendas"
  FOR UPDATE USING (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Only admin can delete orders" ON "Encomendas"
  FOR DELETE USING (can_delete_data());

-- 6. Secure order items table
CREATE POLICY "Users can view their own order items" ON "EncomendasItems"
  FOR SELECT USING (encomendaid IN (SELECT id FROM "Encomendas" WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own order items" ON "EncomendasItems"
  FOR INSERT WITH CHECK (encomendaid IN (SELECT id FROM "Encomendas" WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own order items" ON "EncomendasItems"
  FOR UPDATE USING (encomendaid IN (SELECT id FROM "Encomendas" WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own order items" ON "EncomendasItems"
  FOR DELETE USING (encomendaid IN (SELECT id FROM "Encomendas" WHERE user_id = auth.uid()));

-- 7. Secure stock entries table
CREATE POLICY "Users can view their own stock entries" ON "StockEntries"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock entries" ON "StockEntries"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock entries" ON "StockEntries"
  FOR UPDATE USING (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Only admin can delete stock entries" ON "StockEntries"
  FOR DELETE USING (can_delete_data());

-- 8. Secure stock entry items table
CREATE POLICY "Users can view their own stock entry items" ON "StockEntriesItems"
  FOR SELECT USING (entryid IN (SELECT id FROM "StockEntries" WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own stock entry items" ON "StockEntriesItems"
  FOR INSERT WITH CHECK (entryid IN (SELECT id FROM "StockEntries" WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own stock entry items" ON "StockEntriesItems"
  FOR UPDATE USING (entryid IN (SELECT id FROM "StockEntries" WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own stock entry items" ON "StockEntriesItems"
  FOR DELETE USING (entryid IN (SELECT id FROM "StockEntries" WHERE user_id = auth.uid()));

-- 9. Secure stock exits table
CREATE POLICY "Users can view their own stock exits" ON "StockExits"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock exits" ON "StockExits"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock exits" ON "StockExits"
  FOR UPDATE USING (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Only admin can delete stock exits" ON "StockExits"
  FOR DELETE USING (can_delete_data());

-- 10. Secure stock exit items table
CREATE POLICY "Users can view their own stock exit items" ON "StockExitsItems"
  FOR SELECT USING (exitid IN (SELECT id FROM "StockExits" WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own stock exit items" ON "StockExitsItems"
  FOR INSERT WITH CHECK (exitid IN (SELECT id FROM "StockExits" WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own stock exit items" ON "StockExitsItems"
  FOR UPDATE USING (exitid IN (SELECT id FROM "StockExits" WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own stock exit items" ON "StockExitsItems"
  FOR DELETE USING (exitid IN (SELECT id FROM "StockExits" WHERE user_id = auth.uid()));

-- 11. Remove overly permissive policies with 'true' conditions
DROP POLICY IF EXISTS "Usuários podem ver todos os clientes" ON clients;
DROP POLICY IF EXISTS "Usuários podem ver todas as entradas de stock" ON stock_entries;
DROP POLICY IF EXISTS "Usuários podem ver todas as saídas de stock" ON stock_exits;
DROP POLICY IF EXISTS "Usuários podem ver todos os fornecedores" ON suppliers;
DROP POLICY IF EXISTS "Usuários podem ver todos os itens de entrada de stock" ON stock_entry_items;
DROP POLICY IF EXISTS "Usuários podem ver todos os itens de saída de stock" ON stock_exit_items;
DROP POLICY IF EXISTS "Usuários podem ver todos os itens de encomenda" ON order_items;

-- Also remove overly permissive update/insert/delete policies
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios itens de encomenda" ON order_items;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios itens de encomenda" ON order_items;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios itens de encomenda" ON order_items;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios itens de entrada de st" ON stock_entry_items;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios itens de entrada de stoc" ON stock_entry_items;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios itens de entrada de stoc" ON stock_entry_items;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios itens de saída de sto" ON stock_exit_items;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios itens de saída de stock" ON stock_exit_items;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios itens de saída de stock" ON stock_exit_items;

-- 12. Fix database function security by updating search_path
CREATE OR REPLACE FUNCTION public.get_next_counter(counter_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_year INTEGER;
  next_count INTEGER;
  formatted_number TEXT;
  prefix TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Determine the prefix based on counter_id
  IF counter_id = 'order' THEN
    prefix := 'ENC';
  ELSIF counter_id = 'entry' THEN
    prefix := 'COMP';
  ELSIF counter_id = 'exit' THEN
    prefix := 'VEN';
  ELSE
    prefix := counter_id;
  END IF;
  
  -- Check if year has changed and create a new counter if needed
  IF NOT EXISTS (
    SELECT 1 FROM public.counters 
    WHERE id = counter_id AND year = current_year
  ) THEN
    -- Insert a new counter for the new year
    INSERT INTO public.counters (id, year, current_count)
    VALUES (counter_id, current_year, 0);
  END IF;
  
  -- Increment counter and get the new value
  UPDATE public.counters
  SET current_count = current_count + 1
  WHERE id = counter_id AND year = current_year
  RETURNING current_count INTO next_count;
  
  -- Format the counter with leading zeros (e.g., ENC-2025/001)
  formatted_number := prefix || '-' || current_year || '/' || LPAD(next_count::TEXT, 3, '0');
  
  RETURN formatted_number;
END;
$function$;