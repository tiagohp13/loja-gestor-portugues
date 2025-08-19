-- Fix the remaining functions without proper search_path settings

CREATE OR REPLACE FUNCTION public.can_delete_data(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN public.get_user_access_level($1) = 'admin';
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_write_data(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN public.get_user_access_level($1) IN ('admin', 'editor');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_order_items(p_order_id uuid)
RETURNS TABLE(id uuid, order_id uuid, product_id uuid, product_name text, quantity integer, sale_price numeric)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.encomendaid,
    i.productid,
    i.productname,
    i.quantity,
    i.saleprice
  FROM 
    public."EncomendasItems" i
  WHERE 
    i.encomendaid = p_order_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_orders()
RETURNS TABLE(id uuid, client_id uuid, client_name text, order_number text, date timestamp with time zone, notes text, status text, discount numeric, created_at timestamp with time zone, updated_at timestamp with time zone, converted_to_exit_id uuid)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.clientid, 
    e.clientname, 
    e.ordernumber, 
    e.date, 
    e.notes, 
    e.status, 
    e.discount, 
    e.createdat, 
    e.updatedat, 
    e.convertedtostockexitid
  FROM 
    public."Encomendas" e
  ORDER BY 
    e.createdat DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_entries()
RETURNS TABLE(id uuid, supplier_id uuid, supplier_name text, entry_number text, date timestamp with time zone, invoice_number text, notes text, status text, discount numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.supplierid, 
    e.suppliername, 
    e.entrynumber, 
    e.date, 
    e.invoicenumber, 
    e.notes, 
    e.status, 
    e.discount, 
    e.createdat, 
    e.updatedat
  FROM 
    public."StockEntries" e
  ORDER BY 
    e.createdat DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_entry_items(p_entry_id uuid)
RETURNS TABLE(id uuid, entry_id uuid, product_id uuid, product_name text, quantity integer, purchase_price numeric)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.entryid,
    i.productid,
    i.productname,
    i.quantity,
    i.purchaseprice
  FROM 
    public."StockEntriesItems" i
  WHERE 
    i.entryid = p_entry_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_exits()
RETURNS TABLE(id uuid, client_id uuid, client_name text, reason text, exit_number text, date timestamp with time zone, invoice_number text, notes text, status text, discount numeric, from_order_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.clientid, 
    e.clientname, 
    e.reason,
    e.exitnumber, 
    e.date, 
    e.invoicenumber, 
    e.notes, 
    e.status, 
    e.discount,
    e.fromorderid,
    e.createdat, 
    e.updatedat
  FROM 
    public."StockExits" e
  ORDER BY 
    e.createdat DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_exit_items(p_exit_id uuid)
RETURNS TABLE(id uuid, exit_id uuid, product_id uuid, product_name text, quantity integer, sale_price numeric)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.exitid,
    i.productid,
    i.productname,
    i.quantity,
    i.saleprice
  FROM 
    public."StockExitsItems" i
  WHERE 
    i.exitid = p_exit_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_stock_exit(p_exit_id uuid)
RETURNS TABLE(id uuid, client_id uuid, client_name text, reason text, exit_number text, date timestamp with time zone, invoice_number text, notes text, status text, discount numeric, from_order_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.clientid, 
    e.clientname, 
    e.reason,
    e.exitnumber, 
    e.date, 
    e.invoicenumber, 
    e.notes, 
    e.status, 
    e.discount,
    e.fromorderid,
    e.createdat, 
    e.updatedat
  FROM 
    public."StockExits" e
  WHERE
    e.id = p_exit_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_access_level(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN (
    SELECT access_level 
    FROM public.user_profiles 
    WHERE user_profiles.user_id = $1
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if user exists (we can enhance this later to use a profiles table with roles)
  RETURN auth.uid() IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = $1 AND access_level = 'admin'
  );
END;
$function$;