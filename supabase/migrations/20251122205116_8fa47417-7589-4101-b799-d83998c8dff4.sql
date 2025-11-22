-- Corrigir roles incorretos na tabela tenant_users
-- Apenas os super admins e admins específicos devem ter role 'admin' no tenant
-- Os outros utilizadores devem ter role 'viewer'

-- Atualizar utilizadores do Aqua Paraíso que não são o admin principal
UPDATE tenant_users
SET role = 'viewer'::app_role
WHERE tenant_id IN (SELECT id FROM tenants WHERE slug = 'aquaparaiso')
  AND user_id IN (
    SELECT up.user_id 
    FROM user_profiles up
    WHERE up.email IN ('tiagohp13@gmail.com', 'geral@aquaparaiso.pt')
  );