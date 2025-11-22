import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreateOrganizationData {
  tenantName: string;
  adminEmail: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'unlimited';
  subscriptionStatus: 'active' | 'suspended' | 'cancelled';
  subscriptionStartsAt: string;
  notes?: string;
  isSuperAdminTenant?: boolean;
}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      console.log('Creating organization with data:', data);

      const { data: result, error } = await supabase.functions.invoke('create-organization', {
        body: data
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Erro ao criar organização');
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['user-tenants'] });
      
      let message = 'Organização criada com sucesso!';
      if (data.passwordGenerated && data.temporaryPassword) {
        message += ` Password temporária enviada para ${data.userId}`;
        // Mostrar password temporária ao super admin
        toast.success(message, {
          description: `Password temporária: ${data.temporaryPassword}`,
          duration: 10000
        });
      } else {
        toast.success(message);
      }
    },
    onError: (error: any) => {
      console.error('Error creating organization:', error);
      toast.error(error.message || 'Erro ao criar organização');
    }
  });
};
