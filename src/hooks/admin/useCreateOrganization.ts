import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdditionalUser {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  phone?: string;
}

export interface CreateOrganizationData {
  tenantName: string;
  adminEmail: string;
  adminName?: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'unlimited';
  subscriptionStatus: 'active' | 'suspended' | 'cancelled';
  subscriptionStartsAt: string;
  subscriptionExpiresAt?: string;
  notes?: string;
  taxId?: string;
  phone?: string;
  website?: string;
  industrySector?: string;
  additionalUsers?: Omit<AdditionalUser, 'id'>[];
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
      
      if (data.tenant?.name) {
        message = `Organização "${data.tenant.name}" criada com sucesso!`;
      }
      
      if (data.newUsers > 0) {
        message += ` ${data.newUsers} novo(s) utilizador(es) criado(s).`;
        
        // Mostrar passwords temporárias
        if (data.createdUsers && data.createdUsers.length > 0) {
          const passwordsList = data.createdUsers
            .map((u: any) => `${u.email}: ${u.password}`)
            .join('\\n');
          
          toast.success(message, {
            description: `Passwords temporárias criadas. Guarde estas informações:\n\n${passwordsList}`,
            duration: 15000,
          });
        } else {
          toast.success(message);
        }
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
