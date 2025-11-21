import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TerminateSessionParams {
  userId: string;
  terminateAll?: boolean;
}

export const useTerminateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, terminateAll = false }: TerminateSessionParams) => {
      const { data, error } = await supabase.functions.invoke('terminate-session', {
        body: {
          userId,
          terminateAll,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-audit-logs', variables.userId] });
      
      toast.success(data.message || 'Sessão terminada com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error terminating session:', error);
      toast.error('Erro ao terminar sessão');
    },
  });
};
