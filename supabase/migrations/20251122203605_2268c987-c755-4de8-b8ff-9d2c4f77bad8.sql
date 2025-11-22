-- Associar utilizadores à organização Aqua Paraíso
-- Este script associa geral@aquaparaiso.pt (admin) e tiagohp13@gmail.com (admin) ao tenant Aqua Paraíso

DO $$
DECLARE
  aqua_tenant_id UUID := 'b8e7f9d0-1234-5678-9abc-def012345678';
  tiago_user_id UUID := '53cc471a-054a-4a8e-8e99-79b3681ae18b';
  geral_user_id UUID := 'e9b7d4f9-17d6-4f43-b31b-864997974d2e';
BEGIN
  -- Verificar se já existe associação para tiago
  IF NOT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = aqua_tenant_id AND user_id = tiago_user_id
  ) THEN
    INSERT INTO tenant_users (tenant_id, user_id, role, status)
    VALUES (aqua_tenant_id, tiago_user_id, 'admin', 'active');
    RAISE NOTICE '✅ Utilizador tiagohp13@gmail.com associado como admin';
  ELSE
    RAISE NOTICE 'ℹ️ Utilizador tiagohp13@gmail.com já estava associado';
  END IF;

  -- Verificar se já existe associação para geral
  IF NOT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = aqua_tenant_id AND user_id = geral_user_id
  ) THEN
    INSERT INTO tenant_users (tenant_id, user_id, role, status)
    VALUES (aqua_tenant_id, geral_user_id, 'admin', 'active');
    RAISE NOTICE '✅ Utilizador geral@aquaparaiso.pt associado como admin';
  ELSE
    RAISE NOTICE 'ℹ️ Utilizador geral@aquaparaiso.pt já estava associado';
  END IF;

  RAISE NOTICE '🎉 Associação de utilizadores concluída!';
END $$;