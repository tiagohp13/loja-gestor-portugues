import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DeletedRecord {
  id: string;
  name: string;
  table_type: string;
  deleted_at: string;
  additional_info: any;
}

const fetchDeletedRecords = async (): Promise<DeletedRecord[]> => {
  const { data, error } = await supabase.rpc('get_deleted_records');
  
  if (error) {
    console.error('Error fetching deleted records:', error);
    throw error;
  }
  
  return (data as DeletedRecord[]) || [];
};

const restoreRecord = async ({ tableType, recordId }: { tableType: string; recordId: string }) => {
  const { error } = await supabase.rpc('restore_record', {
    table_name: tableType,
    record_id: recordId
  });
  
  if (error) throw error;
};

const permanentDeleteRecord = async ({ tableType, recordId }: { tableType: string; recordId: string }) => {
  const { error } = await supabase.rpc('permanent_delete_record', {
    table_name: tableType,
    record_id: recordId
  });
  
  if (error) throw error;
};

export const useDeletedRecords = () => {
  return useQuery({
    queryKey: ['deleted-records'],
    queryFn: fetchDeletedRecords,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useRestoreRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: restoreRecord,
    onSuccess: (_, variables) => {
      toast.success('Registo restaurado com sucesso');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['deleted-records'] });
      queryClient.invalidateQueries({ queryKey: [getQueryKeyForTable(variables.tableType)] });
      
      if (['orders', 'stock_exits', 'stock_entries'].includes(variables.tableType)) {
        queryClient.invalidateQueries({ queryKey: ['dashboard-optimized'] });
      }
    },
    onError: (error) => {
      console.error('Error restoring record:', error);
      toast.error('Erro ao restaurar registo');
    }
  });
};

export const usePermanentDeleteRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: permanentDeleteRecord,
    onSuccess: () => {
      toast.success('Registo eliminado permanentemente');
      queryClient.invalidateQueries({ queryKey: ['deleted-records'] });
    },
    onError: (error) => {
      console.error('Error permanently deleting record:', error);
      toast.error('Erro ao eliminar permanentemente');
    }
  });
};

const getQueryKeyForTable = (tableType: string): string => {
  const queryKeyMap: { [key: string]: string } = {
    products: 'products',
    categories: 'categories',
    clients: 'clients',
    suppliers: 'suppliers',
    orders: 'orders',
    stock_entries: 'stock-entries',
    stock_exits: 'stock-exits',
    expenses: 'expenses'
  };
  return queryKeyMap[tableType] || tableType;
};
