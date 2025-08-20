-- Fix critical data exposure issues in suppliers, stock_entries, and stock_exits tables
-- Remove dangerous public access policies and implement proper user-based RLS

-- First, assign orphaned records to admin user to prevent data loss
UPDATE suppliers SET user_id = '72c186e8-db41-4aea-b95f-214a319307f0' WHERE user_id IS NULL;
UPDATE stock_entries SET user_id = '72c186e8-db41-4aea-b95f-214a319307f0' WHERE user_id IS NULL;
UPDATE stock_exits SET user_id = '72c186e8-db41-4aea-b95f-214a319307f0' WHERE user_id IS NULL;

-- Make user_id columns NOT NULL to enforce ownership
ALTER TABLE suppliers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE stock_entries ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE stock_exits ALTER COLUMN user_id SET NOT NULL;

-- Drop dangerous public access policies for suppliers
DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow owners to read suppliers" ON suppliers;

-- Drop dangerous public access policies for stock_entries  
DROP POLICY IF EXISTS "Users can view stock_entries" ON stock_entries;
DROP POLICY IF EXISTS "Allow owners to read stock_entries" ON stock_entries;

-- Drop dangerous public access policies for stock_exits
DROP POLICY IF EXISTS "Users can view stock_exits" ON stock_exits;  
DROP POLICY IF EXISTS "Allow owners to read stock_exits" ON stock_exits;

-- Create secure RLS policies for suppliers
CREATE POLICY "Secure supplier access - own data only"
ON suppliers FOR SELECT
USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

CREATE POLICY "Secure supplier creation - own data only"  
ON suppliers FOR INSERT
WITH CHECK (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Secure supplier updates - own data only"
ON suppliers FOR UPDATE
USING (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Secure supplier deletion - admin only"
ON suppliers FOR DELETE  
USING (can_delete_data());

-- Create secure RLS policies for stock_entries
CREATE POLICY "Secure stock entry access - own data only"
ON stock_entries FOR SELECT
USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

CREATE POLICY "Secure stock entry creation - own data only"
ON stock_entries FOR INSERT  
WITH CHECK (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Secure stock entry updates - own data only"
ON stock_entries FOR UPDATE
USING (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Secure stock entry deletion - admin only"
ON stock_entries FOR DELETE
USING (can_delete_data());

-- Create secure RLS policies for stock_exits
CREATE POLICY "Secure stock exit access - own data only"  
ON stock_exits FOR SELECT
USING (auth.uid() = user_id OR is_user_admin(auth.uid()));

CREATE POLICY "Secure stock exit creation - own data only"
ON stock_exits FOR INSERT
WITH CHECK (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Secure stock exit updates - own data only" 
ON stock_exits FOR UPDATE
USING (auth.uid() = user_id AND can_write_data());

CREATE POLICY "Secure stock exit deletion - admin only"
ON stock_exits FOR DELETE
USING (can_delete_data());

-- Fix functions with mutable search paths to prevent search_path attacks
CREATE OR REPLACE FUNCTION public.get_stock_exits()
RETURNS TABLE(id uuid, client_id uuid, client_name text, reason text, exit_number text, date timestamp with time zone, invoice_number text, notes text, status text, discount numeric, from_order_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.client_id, 
    e.client_name, 
    'sale'::text as reason,
    e.number as exit_number, 
    e.date, 
    e.invoice_number, 
    e.notes, 
    'completed'::text as status, 
    e.discount,
    e.from_order_id,
    e.created_at, 
    e.updated_at
  FROM 
    public.stock_exits e
  WHERE 
    e.user_id = auth.uid() OR public.is_user_admin(auth.uid())
  ORDER BY 
    e.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_exit_items(p_exit_id uuid)
RETURNS TABLE(id uuid, exit_id uuid, product_id uuid, product_name text, quantity integer, sale_price numeric)
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.exit_id,
    i.product_id,
    i.product_name,
    i.quantity,
    i.sale_price
  FROM 
    public.stock_exit_items i
    INNER JOIN public.stock_exits e ON i.exit_id = e.id
  WHERE 
    i.exit_id = p_exit_id
    AND (e.user_id = auth.uid() OR public.is_user_admin(auth.uid()));
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_entries()
RETURNS TABLE(id uuid, supplier_id uuid, supplier_name text, entry_number text, date timestamp with time zone, invoice_number text, notes text, status text, discount numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public' 
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.supplier_id, 
    e.supplier_name, 
    e.number as entry_number, 
    e.date, 
    e.invoice_number, 
    e.notes, 
    'completed'::text as status, 
    0::numeric as discount, 
    e.created_at, 
    e.updated_at
  FROM 
    public.stock_entries e
  WHERE 
    e.user_id = auth.uid() OR public.is_user_admin(auth.uid())
  ORDER BY 
    e.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_entry_items(p_entry_id uuid)
RETURNS TABLE(id uuid, entry_id uuid, product_id uuid, product_name text, quantity integer, purchase_price numeric)
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.entry_id,
    i.product_id,
    i.product_name,
    i.quantity,
    i.purchase_price
  FROM 
    public.stock_entry_items i
    INNER JOIN public.stock_entries e ON i.entry_id = e.id
  WHERE 
    i.entry_id = p_entry_id
    AND (e.user_id = auth.uid() OR public.is_user_admin(auth.uid()));
END;
$function$;