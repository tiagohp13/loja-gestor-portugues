-- 1. Remover a constraint UNIQUE atual (user_id, kpi_name)
ALTER TABLE kpi_targets DROP CONSTRAINT IF EXISTS kpi_targets_user_id_kpi_name_key;

-- 2. Tornar user_id nullable (para compatibilidade, mas não será mais usado para distinguir metas)
ALTER TABLE kpi_targets ALTER COLUMN user_id DROP NOT NULL;

-- 3. Adicionar nova constraint UNIQUE apenas por kpi_name (metas globais)
ALTER TABLE kpi_targets ADD CONSTRAINT kpi_targets_kpi_name_key UNIQUE (kpi_name);

-- 4. Limpar dados duplicados: manter apenas uma meta por KPI (a mais recente)
-- Primeiro, identificar e deletar duplicados, mantendo só o registo mais recente por kpi_name
DELETE FROM kpi_targets a
USING kpi_targets b
WHERE a.kpi_name = b.kpi_name
  AND a.created_at < b.created_at;

-- 5. Atualizar RLS policies para metas globais

-- DROP policies antigas
DROP POLICY IF EXISTS "Users can view their own KPI targets" ON kpi_targets;
DROP POLICY IF EXISTS "Users can insert their own KPI targets" ON kpi_targets;
DROP POLICY IF EXISTS "Users can update their own KPI targets" ON kpi_targets;

-- Criar novas policies para metas globais

-- SELECT: Qualquer utilizador autenticado pode ler as metas globais
CREATE POLICY "Anyone can read global KPI targets"
ON kpi_targets
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Apenas admin pode criar metas
CREATE POLICY "Only admin can insert KPI targets"
ON kpi_targets
FOR INSERT
TO authenticated
WITH CHECK (is_user_admin(auth.uid()));

-- UPDATE: Apenas admin pode atualizar metas
CREATE POLICY "Only admin can update KPI targets"
ON kpi_targets
FOR UPDATE
TO authenticated
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- DELETE: Apenas admin pode apagar metas
CREATE POLICY "Only admin can delete KPI targets"
ON kpi_targets
FOR DELETE
TO authenticated
USING (is_user_admin(auth.uid()));