
import { supabase, getCurrentUserId } from '@/integrations/supabase/client';
import { KPI } from '@/components/statistics/KPIPanel';

export interface KpiTarget {
  id?: string;
  user_id: string;
  kpi_name: string;
  target_value: number;
}

/**
 * Salva as metas dos KPIs no banco de dados (metas globais para toda a aplicação)
 * Apenas admin pode salvar metas
 */
export const saveKpiTargets = async (kpis: KPI[]): Promise<void> => {
  try {
    // Verificar se o usuário está autenticado
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    // Usar upsert para criar/atualizar metas globais (sem user_id)
    const upserts = kpis.map((kpi) => ({
      kpi_name: kpi.name,
      target_value: kpi.target,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('kpi_targets')
      .upsert(upserts, {
        onConflict: 'kpi_name', // Metas globais: apenas um registo por KPI
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Erro ao salvar metas dos KPIs:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar metas dos KPIs:', error);
    throw error;
  }
};

/**
 * Carrega as metas dos KPIs do banco de dados (metas globais)
 * Todos os utilizadores (admin, editor, viewer) veem as mesmas metas
 */
export const loadKpiTargets = async (): Promise<Record<string, number>> => {
  const targets: Record<string, number> = {};
  
  try {
    // Ler todas as metas globais (sem filtro por user_id)
    const { data, error } = await supabase
      .from('kpi_targets')
      .select('kpi_name, target_value');

    if (error) {
      console.error('Erro ao carregar metas dos KPIs:', error);
      return targets;
    }

    // Transformar os dados em um objeto de metas
    if (data && data.length > 0) {
      data.forEach(target => {
        targets[target.kpi_name] = target.target_value;
      });
    }
  } catch (error) {
    console.error('Erro ao carregar metas dos KPIs:', error);
  }

  return targets;
};
