-- SECURITY FIX: Clean up supplier table policies to prevent contact information theft
-- First check what policies currently exist and remove them carefully

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remove all existing policies on suppliers table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'suppliers'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.suppliers', policy_record.policyname);
    END LOOP;
END $$;

-- Create new secure policies that prevent contact information theft
-- Users can only see their own supplier data (NO admin override)
CREATE POLICY "suppliers_select_own_data_only" 
ON public.suppliers 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can only create suppliers for themselves
CREATE POLICY "suppliers_insert_own_data_only" 
ON public.suppliers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id AND can_write_data());

-- Users can only update their own suppliers
CREATE POLICY "suppliers_update_own_data_only" 
ON public.suppliers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND can_write_data());

-- Only allow deletion of own suppliers and only by admins
CREATE POLICY "suppliers_delete_admin_only" 
ON public.suppliers 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id AND can_delete_data());

-- Log security event for audit trail
SELECT public.log_security_event(
  'POLICY_HARDENING', 
  'Supplier table policies hardened to prevent contact information theft - removed admin access to all supplier data', 
  'suppliers', 
  NULL
);