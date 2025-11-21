import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch products that are in pending requisições
 * Returns a Set of product IDs for efficient lookup
 */
export const usePendingRequisicoes = () => {
  return useQuery({
    queryKey: ['pending-requisicoes-products'],
    queryFn: async () => {
      // First, get all pending requisições
      const { data: requisicoes, error: reqError } = await supabase
        .from('requisicoes')
        .select('id')
        .eq('estado', 'encomendado')
        .is('deleted_at', null);

      if (reqError) throw reqError;
      if (!requisicoes || requisicoes.length === 0) {
        return new Set<string>();
      }

      // Then, get all items from those requisições
      const requisicaoIds = requisicoes.map(r => r.id);
      const { data: items, error: itemsError } = await supabase
        .from('requisicao_itens')
        .select('produto_id')
        .in('requisicao_id', requisicaoIds);

      if (itemsError) throw itemsError;
      if (!items) return new Set<string>();

      // Return as Set for O(1) lookup
      const productIds = items
        .map(i => i.produto_id)
        .filter((id): id is string => Boolean(id));
      
      return new Set(productIds);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
