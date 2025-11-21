import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchRecordDetail = async (recordId: string, recordType: string) => {
  let query;
  
  switch (recordType) {
    case 'products':
      query = supabase
        .from('products')
        .select('*')
        .eq('id', recordId)
        .maybeSingle();
      break;
      
    case 'clients':
      query = supabase
        .from('clients')
        .select('*')
        .eq('id', recordId)
        .maybeSingle();
      break;
      
    case 'suppliers':
      query = supabase
        .from('suppliers')
        .select('*')
        .eq('id', recordId)
        .maybeSingle();
      break;
      
    case 'orders':
      query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', recordId)
        .maybeSingle();
      break;
      
    case 'stock_entries':
      query = supabase
        .from('stock_entries')
        .select('*, stock_entry_items(*)')
        .eq('id', recordId)
        .maybeSingle();
      break;
      
    case 'stock_exits':
      query = supabase
        .from('stock_exits')
        .select('*, stock_exit_items(*)')
        .eq('id', recordId)
        .maybeSingle();
      break;
      
    case 'expenses':
      query = supabase
        .from('expenses')
        .select('*, expense_items(*)')
        .eq('id', recordId)
        .maybeSingle();
      break;
      
    default:
      throw new Error(`Unknown record type: ${recordType}`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const useDeletedRecordDetail = (recordId: string | null, recordType: string | null) => {
  return useQuery({
    queryKey: ['deleted-record-detail', recordId, recordType],
    queryFn: () => fetchRecordDetail(recordId!, recordType!),
    enabled: !!recordId && !!recordType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
