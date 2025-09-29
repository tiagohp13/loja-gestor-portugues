-- FASE 3: MELHORIAS DE PERFORMANCE E CONSTRAINTS FINAIS

-- Corrigir user_id NOT NULL para segurança RLS
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE suppliers ALTER COLUMN user_id SET NOT NULL;

-- Adicionar constraints de foreign key em falta
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product_id 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE stock_entry_items ADD CONSTRAINT fk_stock_entry_items_entry_id 
  FOREIGN KEY (entry_id) REFERENCES stock_entries(id) ON DELETE CASCADE;

ALTER TABLE stock_entry_items ADD CONSTRAINT fk_stock_entry_items_product_id 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE stock_exit_items ADD CONSTRAINT fk_stock_exit_items_exit_id 
  FOREIGN KEY (exit_id) REFERENCES stock_exits(id) ON DELETE CASCADE;

ALTER TABLE stock_exit_items ADD CONSTRAINT fk_stock_exit_items_product_id 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE expense_items ADD CONSTRAINT fk_expense_items_expense_id 
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE;

-- Adicionar índices para melhor performance em ordenação
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_client_name ON orders(client_name);

CREATE INDEX IF NOT EXISTS idx_stock_entries_date ON stock_entries(date);
CREATE INDEX IF NOT EXISTS idx_stock_entries_created_at ON stock_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_entries_supplier_name ON stock_entries(supplier_name);

CREATE INDEX IF NOT EXISTS idx_stock_exits_date ON stock_exits(date);
CREATE INDEX IF NOT EXISTS idx_stock_exits_created_at ON stock_exits(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_exits_client_name ON stock_exits(client_name);

-- Otimizar tabela de transações
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON transactions(user_id, date DESC);

-- Corrigir functions para search_path (security warning)
CREATE OR REPLACE FUNCTION public.get_next_counter(counter_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    INSERT INTO public.counters (id, year, current_count)
    VALUES (counter_id, current_year, 0);
  END IF;
  
  -- Increment counter and get the new value
  UPDATE public.counters
  SET current_count = current_count + 1
  WHERE id = counter_id AND year = current_year
  RETURNING current_count INTO next_count;
  
  -- Format the counter with leading zeros
  formatted_number := prefix || '-' || current_year || '/' || LPAD(next_count::TEXT, 3, '0');
  
  RETURN formatted_number;
END;
$function$;