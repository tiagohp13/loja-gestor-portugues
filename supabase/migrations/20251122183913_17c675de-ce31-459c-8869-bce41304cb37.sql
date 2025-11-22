-- ============================================
-- CRIAÇÃO DO TENANT AQUAPARAÍSO COMO CLIENTE
-- ============================================

-- 1. Criar o tenant AquaParaíso
INSERT INTO public.tenants (id, name, slug, status, settings)
VALUES (
  'b8e7f9d0-1234-5678-9abc-def012345678',
  'AquaParaíso',
  'aquaparaiso',
  'active',
  '{
    "logo": "/lovable-uploads/3841c0e4-f3de-4811-a15b-404f0ea98932.png",
    "primaryColor": "#1e40af",
    "timezone": "Europe/Lisbon"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    slug = EXCLUDED.slug,
    settings = EXCLUDED.settings;

-- 2. Criar subscription unlimited para AquaParaíso
INSERT INTO public.tenant_subscriptions (tenant_id, plan_name, status, max_users, max_products, max_storage_gb)
VALUES (
  'b8e7f9d0-1234-5678-9abc-def012345678',
  'unlimited',
  'active',
  NULL,
  NULL,
  NULL
)
ON CONFLICT (tenant_id) DO UPDATE
SET plan_name = EXCLUDED.plan_name,
    status = EXCLUDED.status,
    max_users = EXCLUDED.max_users,
    max_products = EXCLUDED.max_products,
    max_storage_gb = EXCLUDED.max_storage_gb;

-- 3. Associar super admin ao tenant como admin
DO $$
DECLARE
  v_super_admin_id UUID;
BEGIN
  SELECT user_id INTO v_super_admin_id
  FROM public.user_profiles
  WHERE email = 'tiagohp13@hotmail.com'
  LIMIT 1;

  IF v_super_admin_id IS NOT NULL THEN
    INSERT INTO public.tenant_users (user_id, tenant_id, role, status)
    VALUES (
      v_super_admin_id,
      'b8e7f9d0-1234-5678-9abc-def012345678',
      'admin',
      'active'
    )
    ON CONFLICT (user_id, tenant_id) DO UPDATE
    SET role = EXCLUDED.role,
        status = EXCLUDED.status;

    INSERT INTO public.user_contexts (user_id, current_tenant_id)
    VALUES (v_super_admin_id, 'b8e7f9d0-1234-5678-9abc-def012345678')
    ON CONFLICT (user_id) DO UPDATE
    SET current_tenant_id = EXCLUDED.current_tenant_id;
  END IF;
END $$;

-- 4. Migrar dados existentes para o tenant AquaParaíso
UPDATE public.products SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.categories SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.clients SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.suppliers SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.orders SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.stock_entries SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.stock_exits SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.expenses SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;
UPDATE public.requisicoes SET tenant_id = 'b8e7f9d0-1234-5678-9abc-def012345678' WHERE tenant_id IS NULL;