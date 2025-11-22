-- Criar função para proteger o super admin principal
CREATE OR REPLACE FUNCTION protect_primary_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Apenas proteger em operações de DELETE
  IF TG_OP = 'DELETE' THEN
    -- Obter o email do utilizador
    SELECT email INTO user_email
    FROM user_profiles
    WHERE user_id = OLD.user_id;
    
    -- Verificar se é o super admin protegido
    IF user_email = 'tiagohp13@hotmail.com' AND OLD.role = 'super_admin' THEN
      RAISE EXCEPTION 'Não é permitido remover o papel de super admin do utilizador principal do sistema';
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Criar trigger para proteger o super admin principal
DROP TRIGGER IF EXISTS prevent_primary_super_admin_removal ON user_system_roles;
CREATE TRIGGER prevent_primary_super_admin_removal
  BEFORE DELETE ON user_system_roles
  FOR EACH ROW
  EXECUTE FUNCTION protect_primary_super_admin();

-- Adicionar comentário para documentação
COMMENT ON FUNCTION protect_primary_super_admin() IS 'Protege o super admin principal (tiagohp13@hotmail.com) de ser removido do sistema';