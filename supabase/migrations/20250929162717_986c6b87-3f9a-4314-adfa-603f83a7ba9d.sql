-- SECURITY FIX: Clean up supplier table policies to prevent contact information theft
-- Remove all existing policies and implement secure, minimal access policies

-- Drop all existing policies on suppliers table
DROP POLICY IF EXISTS "Admin and editor can insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admin and editor can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can access all suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow owners to delete suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow owners to insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow owners to update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Only admin can delete suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Secure supplier access - own data only" ON public.suppliers;
DROP POLICY IF EXISTS "Secure supplier creation - own data only" ON public.suppliers;
DROP POLICY IF EXISTS "Secure supplier deletion - admin only" ON public.suppliers;
DROP POLICY IF EXISTS "Secure supplier updates - own data only" ON public.suppliers;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios fornecedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios fornecedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios fornecedores" ON public.suppliers;

-- Create new secure policies that prevent contact information theft
-- Users can only see their own supplier data
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
  'Supplier table policies hardened to prevent contact information theft', 
  'suppliers', 
  NULL
);