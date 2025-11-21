
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

    // Use upsert to handle insert/update in a single batch operation
    const upserts = kpis.map((kpi) => ({
      user_id: userId,
      kpi_name: kpi.name,
      target_value: kpi.target,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('kpi_targets')
      .upsert(upserts, {
        onConflict: 'user_id,kpi_name',
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
 * Carrega as metas dos KPIs do banco de dados
 * Para viewers, carrega as metas definidas por um administrador
 * Para admins/editors, carrega suas próprias metas
 */
export const loadKpiTargets = async (): Promise<Record<string, number>> => {
  const targets: Record<string, number> = {};
  
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('Usuário não autenticado');
      return targets;
    }

    // Verificar o role do usuário atual
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    let targetUserId = userId;

    // Se o usuário for viewer, buscar as metas de um administrador
    if (userRole?.role === 'viewer') {
      const { data: adminUser } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminUser) {
        targetUserId = adminUser.user_id;
      }
    }

    const { data, error } = await supabase
      .from('kpi_targets')
      .select('kpi_name, target_value')
      .eq('user_id', targetUserId);

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
