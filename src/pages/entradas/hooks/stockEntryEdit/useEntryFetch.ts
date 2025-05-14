
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { createInitialState, mapApiDataToFormState } from './utils';
import { StockEntryFormState } from './types';

export const useEntryFetch = (id?: string) => {
  const navigate = useNavigate();
  const [entry, setEntry] = useState<StockEntryFormState>(createInitialState());
  
  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        try {
          const { data, error } = await supabase
            .from('stock_entries')
            .select(`
              *,
              stock_entry_items(*)
            `)
            .eq('id', id)
            .single();

          if (error) {
            console.error("Error fetching stock entry:", error);
            toast({
              title: "Erro",
              description: "Erro ao carregar entrada de stock",
              variant: "destructive"
            });
            navigate('/entradas/historico');
            return;
          }

          if (data) {
            setEntry(mapApiDataToFormState(data));
          }
        } catch (error) {
          console.error("Error in fetchEntry:", error);
          toast({
            title: "Erro",
            description: "Erro ao carregar entrada de stock",
            variant: "destructive"
          });
          navigate('/entradas/historico');
        }
      };

      fetchEntry();
    }
  }, [id, navigate]);

  return { entry, setEntry };
};
