-- Drop the custom users table as it conflicts with Supabase Auth and has weak security
-- All authentication should go through Supabase Auth system only
DROP TABLE IF EXISTS public.users CASCADE;

-- Update database functions to use proper search_path for security
-- This prevents search_path manipulation attacks

CREATE OR REPLACE FUNCTION public.soft_delete_record(table_name text, record_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.restore_record(table_name text, record_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.permanent_delete_record(table_name text, record_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_access_level(user_id uuid DEFAULT auth.uid())
 RETURNS text
 LANGUAGE plpgsql
 STABLE 
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT access_level 
    FROM public.user_profiles 
    WHERE user_profiles.user_id = $1
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE 
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = $1 AND access_level = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_write_data(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE 
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.get_user_access_level($1) IN ('admin', 'editor');
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_delete_data(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE 
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.get_user_access_level($1) = 'admin';
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, access_level)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_description text, affected_table text DEFAULT NULL::text, affected_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log to PostgreSQL logs for security monitoring
  RAISE LOG 'SECURITY EVENT - Type: %, Description: %, User: %, Table: %, ID: %, Timestamp: %', 
    event_type, 
    event_description, 
    auth.uid(), 
    affected_table, 
    affected_id, 
    now();
END;
$function$;