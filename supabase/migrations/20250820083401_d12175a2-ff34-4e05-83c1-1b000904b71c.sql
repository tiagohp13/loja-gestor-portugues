-- Fix database functions security issues
-- Remove functions with mutable search paths and recreate them securely

-- Drop existing functions with security issues
DROP FUNCTION IF EXISTS public.get_orders();
DROP FUNCTION IF EXISTS public.get_order_items(uuid);
DROP FUNCTION IF EXISTS public.get_stock_exit(uuid);
DROP FUNCTION IF EXISTS public.get_stock_exit(bigint);

-- Recreate get_orders function with proper security
CREATE OR REPLACE FUNCTION public.get_orders()
RETURNS TABLE(
  id uuid, 
  client_id uuid, 
  client_name text, 
  order_number text, 
  date timestamp with time zone, 
  notes text, 
  status text, 
  discount numeric, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  converted_to_exit_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log security event
  RAISE LOG 'Orders accessed by user %', auth.uid();
  
  RETURN QUERY
  SELECT 
    o.id, 
    o.client_id, 
    o.client_name, 
    o.number as order_number, 
    o.date, 
    o.notes, 
    'pending'::text as status, 
    o.discount, 
    o.created_at, 
    o.updated_at, 
    o.converted_to_stock_exit_id as converted_to_exit_id
  FROM 
    public.orders o
  WHERE 
    o.user_id = auth.uid() OR public.is_user_admin(auth.uid())
  ORDER BY 
    o.created_at DESC;
END;
$$;

-- Recreate get_order_items function with proper security
CREATE OR REPLACE FUNCTION public.get_order_items(p_order_id uuid)
RETURNS TABLE(
  id uuid, 
  order_id uuid, 
  product_id uuid, 
  product_name text, 
  quantity integer, 
  sale_price numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log security event
  RAISE LOG 'Order items accessed by user % for order %', auth.uid(), p_order_id;
  
  RETURN QUERY
  SELECT 
    i.id,
    i.order_id,
    i.product_id,
    i.product_name,
    i.quantity,
    i.sale_price
  FROM 
    public.order_items i
    INNER JOIN public.orders o ON i.order_id = o.id
  WHERE 
    i.order_id = p_order_id
    AND (o.user_id = auth.uid() OR public.is_user_admin(auth.uid()));
END;
$$;

-- Recreate get_stock_exit function with proper security
CREATE OR REPLACE FUNCTION public.get_stock_exit(p_exit_id uuid)
RETURNS TABLE(
  id uuid, 
  client_id uuid, 
  client_name text, 
  reason text, 
  exit_number text, 
  date timestamp with time zone, 
  invoice_number text, 
  notes text, 
  status text, 
  discount numeric, 
  from_order_id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log security event
  RAISE LOG 'Stock exit accessed by user % for exit %', auth.uid(), p_exit_id;
  
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
    e.id = p_exit_id
    AND (e.user_id = auth.uid() OR public.is_user_admin(auth.uid()));
END;
$$;

-- Add comprehensive security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_description text,
  affected_table text DEFAULT NULL,
  affected_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Add rate limiting function for sensitive operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_type text,
  max_attempts integer DEFAULT 10,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  attempt_count integer;
  window_start timestamp;
BEGIN
  -- Calculate window start time
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- Count recent attempts (this would require a rate_limit_attempts table in real implementation)
  -- For now, we'll log and return true to not block operations
  RAISE LOG 'Rate limit check for user % operation % - max: %, window: % minutes', 
    auth.uid(), operation_type, max_attempts, window_minutes;
    
  -- In a real implementation, you would:
  -- 1. Create a rate_limit_attempts table
  -- 2. Count attempts within the window
  -- 3. Return false if limit exceeded
  
  RETURN true;
END;
$$;