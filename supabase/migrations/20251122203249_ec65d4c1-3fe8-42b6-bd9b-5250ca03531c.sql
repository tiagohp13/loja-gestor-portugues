-- Migration: Consolidar Default Organization em Aqua Paraíso
-- Migra TODOS os dados (incluindo soft-deleted) e remove Default Organization

DO $$
DECLARE
  default_tenant_id UUID := '7cdf1071-9bb0-42b7-a80d-fae17c59d257';
  aqua_tenant_id UUID := 'b8e7f9d0-1234-5678-9abc-def012345678';
  total_records INT;
BEGIN
  RAISE NOTICE '🔄 Consolidando Default Organization em Aqua Paraíso';

  -- MIGRAR TODOS OS DADOS (incluindo soft-deleted)
  UPDATE products SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE clients SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE suppliers SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE categories SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE stock_exits SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE stock_entries SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE orders SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE expenses SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;
  UPDATE requisicoes SET tenant_id = aqua_tenant_id WHERE tenant_id = default_tenant_id;

  RAISE NOTICE '✅ Dados migrados';

  -- VERIFICAÇÃO FINAL
  SELECT 
    (SELECT COUNT(*) FROM products WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM clients WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM suppliers WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM categories WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM stock_exits WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM stock_entries WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM orders WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM expenses WHERE tenant_id = default_tenant_id) +
    (SELECT COUNT(*) FROM requisicoes WHERE tenant_id = default_tenant_id)
  INTO total_records;

  RAISE NOTICE '🔍 Registos restantes: %', total_records;

  IF total_records > 0 THEN
    RAISE EXCEPTION '⚠️ Ainda existem % registos! Abortando.', total_records;
  END IF;

  -- REMOVER DEFAULT ORGANIZATION
  DELETE FROM user_contexts WHERE current_tenant_id = default_tenant_id;
  DELETE FROM tenant_users WHERE tenant_id = default_tenant_id;
  DELETE FROM tenant_subscriptions WHERE tenant_id = default_tenant_id;
  DELETE FROM tenants WHERE id = default_tenant_id;

  RAISE NOTICE '✅ Default Organization removida. Consolidação completa!';
  
END $$;