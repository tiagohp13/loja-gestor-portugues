-- ============================================
-- RBAC System Implementation (Corrigido)
-- ============================================

-- 1. Criar enum para os papéis da aplicação (com verificação manual)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;
END $$;

-- 2. Criar tabela de roles dos utilizadores
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Ativar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função SECURITY DEFINER para verificar roles (evita recursão no RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- 5. Criar função para obter o role principal do utilizador
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'viewer' THEN 3
    END
  LIMIT 1;
$$;

-- 6. Criar função para sincronizar access_level com roles
CREATE OR REPLACE FUNCTION public.sync_user_role_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
  
  IF NEW.access_level = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'admin');
  ELSIF NEW.access_level = 'editor' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'editor');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'viewer');
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. Criar trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.user_profiles;
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE OF access_level ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_from_profile();

-- 8. Migrar dados existentes de user_profiles para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  CASE access_level
    WHEN 'admin' THEN 'admin'::public.app_role
    WHEN 'editor' THEN 'editor'::public.app_role
    ELSE 'viewer'::public.app_role
  END
FROM public.user_profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. Políticas RLS para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Criar função helper para verificar múltiplas roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
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

-- 11. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 12. Adicionar comentários para documentação
COMMENT ON TABLE public.user_roles IS 'Armazena os papéis (roles) atribuídos aos utilizadores para controlo de acesso (RBAC)';
COMMENT ON FUNCTION public.has_role IS 'Verifica se um utilizador tem um papel específico. Usa SECURITY DEFINER para evitar recursão no RLS';
COMMENT ON FUNCTION public.get_user_role IS 'Retorna o papel principal do utilizador (prioridade: admin > editor > viewer)';
COMMENT ON FUNCTION public.has_any_role IS 'Verifica se um utilizador tem algum dos papéis especificados';