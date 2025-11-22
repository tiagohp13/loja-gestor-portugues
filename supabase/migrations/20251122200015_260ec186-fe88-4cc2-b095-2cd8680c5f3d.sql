-- Verificar e criar tenant AquaParaíso se não existir
DO $$
DECLARE
  aquaparaiso_tenant_id UUID;
  super_admin_user_id UUID;
BEGIN
  -- Obter o ID do super admin principal
  SELECT user_id INTO super_admin_user_id
  FROM user_profiles
  WHERE email = 'tiagohp13@hotmail.com'
  LIMIT 1;

  -- Verificar se o tenant AquaParaíso existe
  SELECT id INTO aquaparaiso_tenant_id
  FROM tenants
  WHERE slug = 'aquaparaiso'
  LIMIT 1;

  -- Se não existir, criar
  IF aquaparaiso_tenant_id IS NULL THEN
    RAISE NOTICE 'Criando tenant AquaParaíso...';
    
    INSERT INTO tenants (name, slug, status, settings)
    VALUES (
      'AquaParaíso',
      'aquaparaiso',
      'active',
      jsonb_build_object(
        'is_superadmin_tenant', true,
        'notes', 'Tenant principal criado automaticamente'
      )
    )
    RETURNING id INTO aquaparaiso_tenant_id;
    
    RAISE NOTICE 'Tenant AquaParaíso criado com ID: %', aquaparaiso_tenant_id;
    
    -- Criar subscrição unlimited
    INSERT INTO tenant_subscriptions (
      tenant_id,
      plan_name,
      status,
      max_users,
      max_products
    )
    VALUES (
      aquaparaiso_tenant_id,
      'unlimited',
      'active',
      NULL, -- ilimitado
      NULL  -- ilimitado
    );
    
    RAISE NOTICE 'Subscrição unlimited criada para AquaParaíso';
    
    -- Associar super admin ao tenant se existir
    IF super_admin_user_id IS NOT NULL THEN
      INSERT INTO tenant_users (tenant_id, user_id, role, status)
      VALUES (aquaparaiso_tenant_id, super_admin_user_id, 'admin', 'active')
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE 'Super admin associado ao tenant AquaParaíso';
      
      -- Criar ou atualizar contexto do utilizador
      INSERT INTO user_contexts (user_id, current_tenant_id)
      VALUES (super_admin_user_id, aquaparaiso_tenant_id)
      ON CONFLICT (user_id) 
      DO UPDATE SET current_tenant_id = aquaparaiso_tenant_id;
      
      RAISE NOTICE 'Contexto do super admin atualizado para AquaParaíso';
    END IF;
    
    -- Migrar dados existentes para o tenant AquaParaíso (onde tenant_id é NULL)
    -- Isto vai associar todos os dados sem tenant ao AquaParaíso
    
    UPDATE products SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE categories SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE clients SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE suppliers SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE orders SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE stock_entries SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE stock_exits SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE expenses SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    UPDATE requisicoes SET tenant_id = aquaparaiso_tenant_id WHERE tenant_id IS NULL;
    
    RAISE NOTICE 'Dados migrados para tenant AquaParaíso';
  ELSE
    RAISE NOTICE 'Tenant AquaParaíso já existe com ID: %', aquaparaiso_tenant_id;
  END IF;
END $$;