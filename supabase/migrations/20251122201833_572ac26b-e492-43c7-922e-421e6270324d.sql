-- Criar função helper segura para verificar se utilizador é admin do tenant
-- Esta função usa SECURITY DEFINER para evitar recursão infinita
CREATE OR REPLACE FUNCTION public.is_tenant_admin(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM tenant_users
    WHERE tenant_id = p_tenant_id
      AND user_id = auth.uid()
      AND role = 'admin'::app_role
      AND status = 'active'
  );
END;
$$;

-- Remover política recursiva antiga
DROP POLICY IF EXISTS tenant_admins_manage_users ON tenant_users;

-- Criar nova política usando a função helper (sem recursão)
CREATE POLICY tenant_admins_manage_users ON tenant_users
  FOR ALL
  TO authenticated
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));

-- Simplificar política de visualização de tenants
DROP POLICY IF EXISTS users_view_own_tenants ON tenants;

CREATE POLICY users_view_own_tenants ON tenants
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id 
      FROM tenant_users 
      WHERE user_id = auth.uid() 
        AND status = 'active'
    )
  );

-- Garantir que a política de super admin também usa função helper
DROP POLICY IF EXISTS super_admins_all_tenant_users ON tenant_users;

CREATE POLICY super_admins_all_tenant_users ON tenant_users
  FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Adicionar comentários para documentação
COMMENT ON FUNCTION public.is_tenant_admin(UUID) IS 
  'Verifica se o utilizador autenticado é admin do tenant especificado. Usa SECURITY DEFINER para evitar recursão infinita nas políticas RLS.';