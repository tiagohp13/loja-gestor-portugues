-- ============================================
-- FASE 1 - Parte 3: Funções de Segurança e Políticas RLS
-- (Migração corrigida sem desativar triggers)
-- ============================================

-- 1. Criar funções de segurança
-- ============================================

-- Verifica se um usuário é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_system_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  );
END;
$$;

-- Obtém o tenant_id atual do usuário
CREATE OR REPLACE FUNCTION public.get_current_tenant_id(_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT current_tenant_id INTO tenant_id
  FROM public.user_contexts
  WHERE user_id = _user_id;
  
  RETURN tenant_id;
END;
$$;

-- Verifica se o usuário tem acesso a um tenant específico
CREATE OR REPLACE FUNCTION public.has_tenant_access(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admins têm acesso a todos os tenants
  IF public.is_super_admin(_user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Verifica se o usuário pertence ao tenant
  RETURN EXISTS (
    SELECT 1 FROM public.tenant_users
    WHERE user_id = _user_id 
      AND tenant_id = _tenant_id
      AND status = 'active'
  );
END;
$$;

-- Verifica se um tenant pode adicionar mais usuários
CREATE OR REPLACE FUNCTION public.can_add_user(_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_users INT;
  current_users INT;
BEGIN
  SELECT ts.max_users INTO max_users
  FROM public.tenant_subscriptions ts
  WHERE ts.tenant_id = _tenant_id AND ts.status = 'active';
  
  IF max_users IS NULL THEN
    RETURN FALSE; -- Sem subscrição ativa
  END IF;
  
  SELECT COUNT(*) INTO current_users
  FROM public.tenant_users
  WHERE tenant_id = _tenant_id AND status = 'active';
  
  RETURN current_users < max_users;
END;
$$;

-- Verifica se um tenant pode adicionar mais produtos
CREATE OR REPLACE FUNCTION public.can_add_product(_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_products INT;
  current_products INT;
BEGIN
  SELECT ts.max_products INTO max_products
  FROM public.tenant_subscriptions ts
  WHERE ts.tenant_id = _tenant_id AND ts.status = 'active';
  
  IF max_products IS NULL THEN
    RETURN TRUE; -- Sem limite se não tiver max_products definido
  END IF;
  
  SELECT COUNT(*) INTO current_products
  FROM public.products
  WHERE user_id IN (
    SELECT user_id FROM public.tenant_users 
    WHERE tenant_id = _tenant_id
  ) AND deleted_at IS NULL;
  
  RETURN current_products < max_products;
END;
$$;

-- 2. Habilitar RLS nas novas tabelas
-- ============================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para tabela TENANTS
-- ============================================

-- Super admins podem fazer tudo
CREATE POLICY "super_admins_all_tenants"
ON public.tenants FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Usuários podem ver seus tenants
CREATE POLICY "users_view_own_tenants"
ON public.tenants FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT tenant_id FROM public.tenant_users
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- 4. Criar políticas RLS para tabela TENANT_USERS
-- ============================================

-- Super admins podem fazer tudo
CREATE POLICY "super_admins_all_tenant_users"
ON public.tenant_users FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Admins do tenant podem gerenciar usuários do seu tenant
CREATE POLICY "tenant_admins_manage_users"
ON public.tenant_users FOR ALL
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users
    WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND status = 'active'
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users
    WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND status = 'active'
  )
);

-- Usuários podem ver suas próprias associações
CREATE POLICY "users_view_own_memberships"
ON public.tenant_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 5. Criar políticas RLS para tabela USER_SYSTEM_ROLES
-- ============================================

-- Super admins podem gerenciar system roles
CREATE POLICY "super_admins_manage_system_roles"
ON public.user_system_roles FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Usuários podem ver seu próprio system role
CREATE POLICY "users_view_own_system_role"
ON public.user_system_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 6. Criar políticas RLS para tabela USER_CONTEXTS
-- ============================================

-- Usuários podem gerenciar seu próprio contexto
CREATE POLICY "users_manage_own_context"
ON public.user_contexts FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Criar políticas RLS para tabela TENANT_SUBSCRIPTIONS
-- ============================================

-- Super admins podem fazer tudo
CREATE POLICY "super_admins_all_subscriptions"
ON public.tenant_subscriptions FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Admins do tenant podem ver a subscrição
CREATE POLICY "tenant_admins_view_subscription"
ON public.tenant_subscriptions FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_users
    WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND status = 'active'
  )
);