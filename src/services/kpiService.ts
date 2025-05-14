
import { supabase, getCurrentUserId } from '@/integrations/supabase/client';
import { KPI } from '@/components/statistics/KPIPanel';

export interface KpiTarget {
  id?: string;
  user_id: string;
  kpi_name: string;
  target_value: number;
}

/**
 * Salva as metas dos KPIs no banco de dados
 */
export const saveKpiTargets = async (kpis: KPI[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('Salvando KPIs para o usuário:', userId);
    console.log('KPIs a serem salvos:', kpis.map(k => ({ nome: k.name, meta: k.target })));

    // Para cada KPI, inserimos ou atualizamos sua meta
    for (const kpi of kpis) {
      const { data: existingTargets, error: fetchError } = await supabase
        .from('kpi_targets')
        .select('*')
        .eq('user_id', userId)
        .eq('kpi_name', kpi.name)
        .maybeSingle();

      if (fetchError) {
        console.error(`Erro ao verificar metas existentes para ${kpi.name}:`, fetchError);
        continue;
      }

      if (existingTargets) {
        // Atualizar meta existente
        console.log(`Atualizando meta existente para ${kpi.name}:`, existingTargets.id, kpi.target);
        const { error } = await supabase
          .from('kpi_targets')
          .update({
            target_value: kpi.target,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTargets.id);

        if (error) {
          console.error(`Erro ao atualizar meta para ${kpi.name}:`, error);
          throw error;
        }
      } else {
        // Inserir nova meta
        console.log(`Inserindo nova meta para ${kpi.name}:`, kpi.target);
        const { error } = await supabase
          .from('kpi_targets')
          .insert({
            user_id: userId,
            kpi_name: kpi.name,
            target_value: kpi.target
          });

        if (error) {
          console.error(`Erro ao inserir meta para ${kpi.name}:`, error);
          throw error;
        }
      }
    }
    
    console.log('Todas as metas foram salvas com sucesso');
  } catch (error) {
    console.error('Erro ao salvar metas dos KPIs:', error);
    throw error;
  }
};

/**
 * Carrega as metas dos KPIs do banco de dados
 */
export const loadKpiTargets = async (): Promise<Record<string, number>> => {
  const targets: Record<string, number> = {};
  
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('Usuário não autenticado');
      return targets;
    }

    console.log('Carregando KPIs para o usuário:', userId);

    const { data, error } = await supabase
      .from('kpi_targets')
      .select('kpi_name, target_value')
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao carregar metas dos KPIs:', error);
      return targets;
    }

    // Transformar os dados em um objeto de metas
    if (data && data.length > 0) {
      console.log('Metas carregadas da base de dados:', data);
      data.forEach(target => {
        targets[target.kpi_name] = target.target_value;
      });
    } else {
      console.log('Nenhuma meta encontrada para o usuário');
    }
  } catch (error) {
    console.error('Erro ao carregar metas dos KPIs:', error);
  }

  return targets;
};
