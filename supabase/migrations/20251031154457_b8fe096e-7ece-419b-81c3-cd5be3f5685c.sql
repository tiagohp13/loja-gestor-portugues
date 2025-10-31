-- ============================================================================
-- SECURITY FIX 1: Restrict Direct Access to Counters Table
-- ============================================================================
-- Problem: Any authenticated user can directly modify counter values
-- Solution: Remove direct access and force use of SECURITY DEFINER functions

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Permitir leituras condicionadas em counters" ON public.counters;
DROP POLICY IF EXISTS "Permitir inserções condicionadas em counters" ON public.counters;
DROP POLICY IF EXISTS "Permitir atualizações condicionadas em counters" ON public.counters;

-- Create restrictive policies: only allow access through SECURITY DEFINER functions
-- No direct SELECT, INSERT, UPDATE, or DELETE from application code

CREATE POLICY "counters_no_direct_access"
ON public.counters
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Note: The get_next_counter and get_next_counter_by_year functions
-- are already SECURITY DEFINER and will continue to work as they
-- bypass RLS and execute with elevated privileges


-- ============================================================================
-- SECURITY FIX 2: Enforce RBAC Through Database, Not Client-Side
-- ============================================================================
-- Problem: RLS policies use user_profiles.access_level which can be manipulated
-- Solution: Update all helper functions to use user_roles table exclusively

-- Update can_write_data to use RBAC user_roles table
CREATE OR REPLACE FUNCTION public.can_write_data(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has admin or editor role in user_roles table
  RETURN public.has_any_role(user_id, ARRAY['admin'::app_role, 'editor'::app_role]);
END;
$$;

-- Update can_delete_data to use RBAC user_roles table
CREATE OR REPLACE FUNCTION public.can_delete_data(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can delete
  RETURN public.has_role(user_id, 'admin'::app_role);
END;
$$;

-- Update is_user_admin to use RBAC user_roles table
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.has_role(user_id, 'admin'::app_role);
END;
$$;

-- Update is_admin to use RBAC user_roles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.has_role(auth.uid(), 'admin'::app_role);
END;
$$;

-- Add search_path to existing RBAC functions for extra security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  );
$$;

-- Add security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_description text,
  affected_table text DEFAULT NULL,
  affected_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log security events for monitoring
  RAISE LOG 'SECURITY EVENT - Type: %, Description: %, User: %, Table: %, ID: %, Timestamp: %', 
    event_type, 
    event_description, 
    auth.uid(), 
    affected_table, 
    affected_id, 
    now();
END;
$$;

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================
-- After this migration:
-- 1. Counters table is protected - only SECURITY DEFINER functions can modify it
-- 2. All permission checks use user_roles table, not user_profiles.access_level
-- 3. All SECURITY DEFINER functions have search_path = public set
-- 4. Client-side checks in React are now just UX - real enforcement is in database
-- ============================================================================