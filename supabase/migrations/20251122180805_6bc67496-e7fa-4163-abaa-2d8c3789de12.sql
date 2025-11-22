-- ============================================
-- FASE 1 - Parte 4 (CORRIGIDA): Triggers e Migração
-- ============================================

-- 1. Remover triggers temporariamente se existirem
-- ============================================

DROP TRIGGER IF EXISTS validate_tenant_user_limit_trigger ON public.tenant_users;
DROP TRIGGER IF EXISTS validate_product_limit_trigger ON public.products;

-- 2. Corrigir função can_add_user para tratar NULL como ilimitado
-- ============================================

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
  
  -- Se max_users é NULL, significa ilimitado
  IF max_users IS NULL THEN
    RETURN TRUE;
  END IF;
  
  SELECT COUNT(*) INTO current_users
  FROM public.tenant_users
  WHERE tenant_id = _tenant_id AND status = 'active';
  
  RETURN current_users < max_users;
END;
$$;

-- 3. Corrigir função can_add_product para tratar NULL como ilimitado
-- ============================================

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
  
  -- Se max_products é NULL, significa ilimitado
  IF max_products IS NULL THEN
    RETURN TRUE;
  END IF;
  
  SELECT COUNT(*) INTO current_products
  FROM public.products
  WHERE user_id IN (
    SELECT user_id FROM public.tenant_users 
    WHERE tenant_id = _tenant_id AND status = 'active'
  ) AND deleted_at IS NULL;
  
  RETURN current_products < max_products;
END;
$$;

-- 4. Criar funções de trigger
-- ============================================

-- Trigger: Criar user_context quando user_profile é criado
CREATE OR REPLACE FUNCTION public.create_user_context_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_contexts (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger: Validar limite de usuários
CREATE OR REPLACE FUNCTION public.validate_tenant_user_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admins não têm limite
  IF public.is_super_admin(NEW.user_id) THEN
    RETURN NEW;
  END IF;
  
  -- Verificar se o tenant pode adicionar mais usuários
  IF NOT public.can_add_user(NEW.tenant_id) THEN
    RAISE EXCEPTION 'Tenant reached maximum user limit';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: Validar limite de produtos
CREATE OR REPLACE FUNCTION public.validate_tenant_product_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  -- Obter tenant do usuário
  SELECT tenant_id INTO user_tenant_id
  FROM public.tenant_users
  WHERE user_id = NEW.user_id AND status = 'active'
  LIMIT 1;
  
  -- Se não tem tenant, permitir (backward compatibility)
  IF user_tenant_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Verificar se o tenant pode adicionar mais produtos
  IF NOT public.can_add_product(user_tenant_id) THEN
    RAISE EXCEPTION 'Tenant reached maximum product limit';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Criar tenant padrão e subscrição
-- ============================================

DO $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Verificar se já existe tenant padrão
  SELECT id INTO default_tenant_id
  FROM public.tenants
  WHERE slug = 'default';
  
  -- Se não existe, criar tenant padrão
  IF default_tenant_id IS NULL THEN
    INSERT INTO public.tenants (id, name, slug, status)
    VALUES (gen_random_uuid(), 'Default Organization', 'default', 'active')
    RETURNING id INTO default_tenant_id;
    
    -- Criar subscrição ilimitada
    INSERT INTO public.tenant_subscriptions (
      tenant_id,
      plan_name,
      status,
      max_users,
      max_products,
      max_storage_gb
    ) VALUES (
      default_tenant_id,
      'unlimited',
      'active',
      NULL,  -- NULL = ilimitado
      NULL,  -- NULL = ilimitado
      NULL   -- NULL = ilimitado
    );
  END IF;
END;
$$;

-- 6. Migrar usuários existentes
-- ============================================

DO $$
DECLARE
  default_tenant_id UUID;
  user_record RECORD;
BEGIN
  -- Obter ID do tenant padrão
  SELECT id INTO default_tenant_id
  FROM public.tenants
  WHERE slug = 'default';
  
  -- Migrar usuários
  FOR user_record IN 
    SELECT user_id, access_level
    FROM public.user_profiles
  LOOP
    -- Adicionar ao tenant padrão
    INSERT INTO public.tenant_users (user_id, tenant_id, role, status)
    VALUES (
      user_record.user_id,
      default_tenant_id,
      CASE 
        WHEN user_record.access_level = 'admin' THEN 'admin'::app_role
        WHEN user_record.access_level = 'editor' THEN 'editor'::app_role
        ELSE 'viewer'::app_role
      END,
      'active'
    )
    ON CONFLICT (user_id, tenant_id) DO NOTHING;
    
    -- Criar contexto
    INSERT INTO public.user_contexts (user_id, current_tenant_id)
    VALUES (user_record.user_id, default_tenant_id)
    ON CONFLICT (user_id) DO UPDATE
    SET current_tenant_id = COALESCE(user_contexts.current_tenant_id, default_tenant_id);
  END LOOP;
END;
$$;

-- 7. Ativar triggers após migração
-- ============================================

CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_context_on_profile();

CREATE TRIGGER validate_tenant_user_limit_trigger
  BEFORE INSERT ON public.tenant_users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_tenant_user_limit();

CREATE TRIGGER validate_product_limit_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_tenant_product_limit();

-- 8. Funções auxiliares de gestão
-- ============================================

-- Trocar de tenant
CREATE OR REPLACE FUNCTION public.switch_tenant(_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_tenant_access(auth.uid(), _tenant_id) THEN
    RAISE EXCEPTION 'User does not have access to this tenant';
  END IF;
  
  UPDATE public.user_contexts
  SET current_tenant_id = _tenant_id,
      updated_at = now()
  WHERE user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;

-- Listar tenants do usuário
CREATE OR REPLACE FUNCTION public.get_user_tenants(_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  tenant_id UUID,
  tenant_name TEXT,
  tenant_slug TEXT,
  user_role app_role,
  is_current BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    tu.role,
    (uc.current_tenant_id = t.id) as is_current
  FROM public.tenants t
  INNER JOIN public.tenant_users tu ON tu.tenant_id = t.id
  LEFT JOIN public.user_contexts uc ON uc.user_id = _user_id
  WHERE tu.user_id = _user_id
    AND tu.status = 'active'
    AND t.status = 'active'
  ORDER BY is_current DESC, t.name;
END;
$$;