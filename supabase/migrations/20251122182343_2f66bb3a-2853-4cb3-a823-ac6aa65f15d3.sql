
-- Primeiro criar unique constraint se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_system_roles_user_id_role_key'
  ) THEN
    ALTER TABLE user_system_roles 
    ADD CONSTRAINT user_system_roles_user_id_role_key 
    UNIQUE (user_id, role);
  END IF;
END $$;

-- Configurar super admin para tiagohp13@hotmail.com
DO $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Obter o user_id do email
  SELECT user_id INTO v_user_id
  FROM user_profiles
  WHERE email = 'tiagohp13@hotmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email tiagohp13@hotmail.com not found';
  END IF;

  -- Obter o tenant default
  SELECT id INTO v_tenant_id
  FROM tenants
  WHERE slug = 'default'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Default tenant not found';
  END IF;

  -- Adicionar super admin role
  INSERT INTO user_system_roles (user_id, role)
  VALUES (v_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Adicionar usuário ao tenant como admin
  INSERT INTO tenant_users (user_id, tenant_id, role, status)
  VALUES (v_user_id, v_tenant_id, 'admin', 'active')
  ON CONFLICT (user_id, tenant_id) 
  DO UPDATE SET role = 'admin', status = 'active';

  -- Criar contexto do usuário
  INSERT INTO user_contexts (user_id, current_tenant_id)
  VALUES (v_user_id, v_tenant_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET current_tenant_id = v_tenant_id;

END $$;
