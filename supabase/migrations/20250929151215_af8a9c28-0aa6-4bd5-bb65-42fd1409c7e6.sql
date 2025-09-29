-- Add status column to tables that don't have it and update existing ones
-- First, let's check and add status columns where needed

-- Update products table (already has status)
-- Update categories table (already has status) 
-- Update clients table (already has status)
-- Update suppliers table (already has status)

-- Add status to orders table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'status') THEN
        ALTER TABLE orders ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Add status to stock_entries table if not exists  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stock_entries' AND column_name = 'status') THEN
        ALTER TABLE stock_entries ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Add status to stock_exits table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stock_exits' AND column_name = 'status') THEN
        ALTER TABLE stock_exits ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Add status to expenses table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'status') THEN
        ALTER TABLE expenses ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Add deleted_at timestamp column for tracking deletion time
-- Products
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'deleted_at') THEN
        ALTER TABLE products ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Categories  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'deleted_at') THEN
        ALTER TABLE categories ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Clients
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'deleted_at') THEN
        ALTER TABLE clients ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Suppliers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'suppliers' AND column_name = 'deleted_at') THEN
        ALTER TABLE suppliers ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'deleted_at') THEN
        ALTER TABLE orders ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Stock entries
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stock_entries' AND column_name = 'deleted_at') THEN
        ALTER TABLE stock_entries ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Stock exits
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stock_exits' AND column_name = 'deleted_at') THEN
        ALTER TABLE stock_exits ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Expenses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'deleted_at') THEN
        ALTER TABLE expenses ADD COLUMN deleted_at timestamp with time zone;
    END IF;
END $$;

-- Create function for soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_record(
    table_name text,
    record_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sql_query text;
BEGIN
    -- Validate table name to prevent SQL injection
    IF table_name NOT IN ('products', 'categories', 'clients', 'suppliers', 'orders', 'stock_entries', 'stock_exits', 'expenses') THEN
        RAISE EXCEPTION 'Invalid table name: %', table_name;
    END IF;
    
    -- Build and execute the soft delete query
    sql_query := format('UPDATE %I SET status = ''deleted'', deleted_at = now() WHERE id = $1', table_name);
    EXECUTE sql_query USING record_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Create function for restore record
CREATE OR REPLACE FUNCTION public.restore_record(
    table_name text,
    record_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sql_query text;
BEGIN
    -- Validate table name to prevent SQL injection
    IF table_name NOT IN ('products', 'categories', 'clients', 'suppliers', 'orders', 'stock_entries', 'stock_exits', 'expenses') THEN
        RAISE EXCEPTION 'Invalid table name: %', table_name;
    END IF;
    
    -- Build and execute the restore query
    sql_query := format('UPDATE %I SET status = ''active'', deleted_at = NULL WHERE id = $1', table_name);
    EXECUTE sql_query USING record_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Create function for permanent delete
CREATE OR REPLACE FUNCTION public.permanent_delete_record(
    table_name text,
    record_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sql_query text;
BEGIN
    -- Validate table name to prevent SQL injection
    IF table_name NOT IN ('products', 'categories', 'clients', 'suppliers', 'orders', 'stock_entries', 'stock_exits', 'expenses') THEN
        RAISE EXCEPTION 'Invalid table name: %', table_name;
    END IF;
    
    -- Build and execute the permanent delete query
    sql_query := format('DELETE FROM %I WHERE id = $1 AND status = ''deleted''', table_name);
    EXECUTE sql_query USING record_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Create function to get deleted records
CREATE OR REPLACE FUNCTION public.get_deleted_records()
RETURNS TABLE(
    id uuid,
    name text,
    table_type text,
    deleted_at timestamp with time zone,
    additional_info jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    -- Products
    SELECT 
        p.id,
        p.name,
        'products'::text as table_type,
        p.deleted_at,
        jsonb_build_object(
            'code', p.code,
            'current_stock', p.current_stock,
            'sale_price', p.sale_price
        ) as additional_info
    FROM products p
    WHERE p.status = 'deleted'
    
    UNION ALL
    
    -- Categories
    SELECT 
        c.id,
        c.name,
        'categories'::text as table_type,
        c.deleted_at,
        jsonb_build_object(
            'description', c.description,
            'product_count', c.product_count
        ) as additional_info
    FROM categories c
    WHERE c.status = 'deleted'
    
    UNION ALL
    
    -- Clients
    SELECT 
        cl.id,
        cl.name,
        'clients'::text as table_type,
        cl.deleted_at,
        jsonb_build_object(
            'email', cl.email,
            'phone', cl.phone,
            'address', cl.address
        ) as additional_info
    FROM clients cl
    WHERE cl.status = 'deleted'
    
    UNION ALL
    
    -- Suppliers
    SELECT 
        s.id,
        s.name,
        'suppliers'::text as table_type,
        s.deleted_at,
        jsonb_build_object(
            'email', s.email,
            'phone', s.phone,
            'address', s.address
        ) as additional_info
    FROM suppliers s
    WHERE s.status = 'deleted'
    
    UNION ALL
    
    -- Orders
    SELECT 
        o.id,
        COALESCE(o.client_name, 'Encomenda ' || o.number) as name,
        'orders'::text as table_type,
        o.deleted_at,
        jsonb_build_object(
            'number', o.number,
            'client_name', o.client_name,
            'date', o.date,
            'discount', o.discount
        ) as additional_info
    FROM orders o
    WHERE o.status = 'deleted'
    
    UNION ALL
    
    -- Stock Entries
    SELECT 
        se.id,
        COALESCE(se.supplier_name, 'Compra ' || se.number) as name,
        'stock_entries'::text as table_type,
        se.deleted_at,
        jsonb_build_object(
            'number', se.number,
            'supplier_name', se.supplier_name,
            'date', se.date,
            'invoice_number', se.invoice_number
        ) as additional_info
    FROM stock_entries se
    WHERE se.status = 'deleted'
    
    UNION ALL
    
    -- Stock Exits
    SELECT 
        sx.id,
        COALESCE(sx.client_name, 'Venda ' || sx.number) as name,
        'stock_exits'::text as table_type,
        sx.deleted_at,
        jsonb_build_object(
            'number', sx.number,
            'client_name', sx.client_name,
            'date', sx.date,
            'invoice_number', sx.invoice_number
        ) as additional_info
    FROM stock_exits sx
    WHERE sx.status = 'deleted'
    
    UNION ALL
    
    -- Expenses
    SELECT 
        e.id,
        COALESCE(e.supplier_name, 'Despesa ' || e.number) as name,
        'expenses'::text as table_type,
        e.deleted_at,
        jsonb_build_object(
            'number', e.number,
            'supplier_name', e.supplier_name,
            'date', e.date
        ) as additional_info
    FROM expenses e
    WHERE e.status = 'deleted'
    
    ORDER BY deleted_at DESC;
END;
$$;

-- Create function for automatic cleanup of old deleted records (30+ days)
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_records()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count integer := 0;
    table_names text[] := ARRAY['products', 'categories', 'clients', 'suppliers', 'orders', 'stock_entries', 'stock_exits', 'expenses'];
    table_name text;
    sql_query text;
    temp_count integer;
BEGIN
    -- Delete records older than 30 days from each table
    FOREACH table_name IN ARRAY table_names
    LOOP
        sql_query := format('DELETE FROM %I WHERE status = ''deleted'' AND deleted_at < now() - interval ''30 days''', table_name);
        EXECUTE sql_query;
        GET DIAGNOSTICS temp_count = ROW_COUNT;
        deleted_count := deleted_count + temp_count;
        
        RAISE LOG 'Cleaned up % old deleted records from table %', temp_count, table_name;
    END LOOP;
    
    RETURN deleted_count;
END;
$$;