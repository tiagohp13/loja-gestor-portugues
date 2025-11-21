-- Corrigir políticas RLS para garantir que viewers têm acesso a todos os dados
-- Problema: As políticas RLS atuais permitem SELECT para auth.uid() IS NOT NULL, 
-- mas pode haver problemas com as funções helper ou com a autenticação

-- 1. Garantir que todas as funções helper têm search_path definido
CREATE OR REPLACE FUNCTION public.get_user_access_level(user_id uuid DEFAULT auth.uid())
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT access_level 
    FROM public.user_profiles 
    WHERE user_profiles.user_id = $1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_write_data(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  -- Verificar no sistema RBAC (user_roles) primeiro
  IF public.has_any_role(user_id, ARRAY['admin'::app_role, 'editor'::app_role]) THEN
    RETURN true;
  END IF;
  
  -- Fallback para access_level
  RETURN public.get_user_access_level(user_id) IN ('admin', 'editor');
END;
$$;

CREATE OR REPLACE FUNCTION public.can_delete_data(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  -- Verificar no sistema RBAC (user_roles) primeiro
  IF public.has_role(user_id, 'admin'::app_role) THEN
    RETURN true;
  END IF;
  
  -- Fallback para access_level
  RETURN public.get_user_access_level(user_id) = 'admin';
END;
$$;

-- 2. Garantir que todas as funções RBAC têm search_path definido
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
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
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
  )
$$;

-- 3. Adicionar comentários nas funções para documentação
COMMENT ON FUNCTION public.get_user_access_level IS 'Retorna o access_level do utilizador da tabela user_profiles';
COMMENT ON FUNCTION public.can_write_data IS 'Verifica se o utilizador pode criar/editar dados (admin ou editor)';
COMMENT ON FUNCTION public.can_delete_data IS 'Verifica se o utilizador pode eliminar dados (apenas admin)';
COMMENT ON FUNCTION public.has_role IS 'Verifica se o utilizador tem um role específico no sistema RBAC';
COMMENT ON FUNCTION public.get_user_role IS 'Retorna o role principal do utilizador do sistema RBAC';
COMMENT ON FUNCTION public.has_any_role IS 'Verifica se o utilizador tem algum dos roles especificados no sistema RBAC';