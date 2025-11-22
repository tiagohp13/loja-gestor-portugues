-- Criar policy para permitir super admins ver tenant_users
-- Esta policy permite que super admins vejam todos os utilizadores de todos os tenants

CREATE POLICY "super_admins_view_all_tenant_users"
ON public.tenant_users
FOR SELECT
TO authenticated
USING (
  public.is_super_admin(auth.uid())
);