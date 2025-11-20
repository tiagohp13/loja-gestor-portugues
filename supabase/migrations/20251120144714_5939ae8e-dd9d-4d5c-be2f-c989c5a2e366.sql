-- Corrigir função get_deleted_records para usar deleted_at ao invés de status
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
SET search_path TO 'public'
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
    WHERE p.deleted_at IS NOT NULL
    
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
    WHERE c.deleted_at IS NOT NULL
    
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
    WHERE cl.deleted_at IS NOT NULL
    
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
    WHERE s.deleted_at IS NOT NULL
    
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
    WHERE o.deleted_at IS NOT NULL
    
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
    WHERE se.deleted_at IS NOT NULL
    
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
    WHERE sx.deleted_at IS NOT NULL
    
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
    WHERE e.deleted_at IS NOT NULL
    
    UNION ALL
    
    -- Requisições
    SELECT 
        r.id,
        COALESCE(r.fornecedor_nome, 'Requisição ' || r.numero) as name,
        'requisicoes'::text as table_type,
        r.deleted_at,
        jsonb_build_object(
            'numero', r.numero,
            'fornecedor_nome', r.fornecedor_nome,
            'data', r.data,
            'estado', r.estado
        ) as additional_info
    FROM requisicoes r
    WHERE r.deleted_at IS NOT NULL
    
    ORDER BY deleted_at DESC;
END;
$$;