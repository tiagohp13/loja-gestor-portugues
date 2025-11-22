-- ============================================
-- CRIAÇÃO DO TENANT AQUAPARAÍSO COMO CLIENTE
-- ============================================

-- 1. Criar ou atualizar tenant AquaParaíso (usando ID fixo para consistência)
INSERT INTO public.tenants (
  id,
  name,
  slug,
  status,
  settings
) VALUES (
  'b8e7f9d0-1234-5678-9abc-def012345678'::uuid,
  'Aqua Paraíso',
  'aquaparaiso',
  'active',
  '{"branding": {"logo_url": "/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png"}}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  status = EXCLUDED.status,
  settings = EXCLUDED.settings,
  updated_at = now();

-- 2. Criar subscrição unlimited para AquaParaíso
INSERT INTO public.tenant_subscriptions (
  tenant_id,
  plan_name,
  status,
  max_users,
  max_products,
  max_storage_gb,
  expires_at
) VALUES (
  'b8e7f9d0-1234-5678-9abc-def012345678'::uuid,
  'unlimited',
  'active',
  NULL, -- sem limite de utilizadores
  NULL, -- sem limite de produtos
  NULL, -- sem limite de armazenamento
  NULL  -- sem expiração
)
ON CONFLICT (tenant_id) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  status = EXCLUDED.status,
  max_users = EXCLUDED.max_users,
  max_products = EXCLUDED.max_products,
  max_storage_gb = EXCLUDED.max_storage_gb,
  expires_at = EXCLUDED.expires_at,
  updated_at = now();

-- 3. Associar tiagohp13@hotmail.com ao tenant AquaParaíso como admin
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar o user_id do tiagohp13@hotmail.com
  SELECT user_id INTO v_user_id
  FROM public.user_profiles
  WHERE email = 'tiagohp13@hotmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Associar ao tenant como admin
    INSERT INTO public.tenant_users (
      user_id,
      tenant_id,
      role,
      status
    ) VALUES (
      v_user_id,
      'b8e7f9d0-1234-5678-9abc-def012345678'::uuid,
      'admin'::app_role,
      'active'
    )
    ON CONFLICT (user_id, tenant_id) DO UPDATE SET
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      updated_at = now();

    -- Atualizar user_context para apontar para AquaParaíso
    INSERT INTO public.user_contexts (
      user_id,
      current_tenant_id
    ) VALUES (
      v_user_id,
      'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
    )
    ON CONFLICT (user_id) DO UPDATE SET
      current_tenant_id = EXCLUDED.current_tenant_id,
      updated_at = now();
  END IF;
END $$;

-- 4. Migrar todos os dados existentes para o tenant AquaParaíso
-- Produtos
UPDATE public.products
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Categorias
UPDATE public.categories
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Clientes
UPDATE public.clients
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Fornecedores
UPDATE public.suppliers
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Encomendas
UPDATE public.orders
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Entradas de Stock
UPDATE public.stock_entries
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Saídas de Stock
UPDATE public.stock_exits
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Despesas
UPDATE public.expenses
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;

-- Requisições
UPDATE public.requisicoes
SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678'::uuid
WHERE tenant_id IS NULL;