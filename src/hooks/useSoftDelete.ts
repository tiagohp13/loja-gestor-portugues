import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSoftDelete = () => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const softDelete = async (
    tableName: string,
    recordId: string,
    recordName?: string
  ): Promise<boolean> => {
    setIsDeleting(recordId);
    
    try {
      const { data, error } = await supabase.rpc('soft_delete_record', {
        table_name: tableName,
        record_id: recordId
      });
      
      if (error) {
        console.error('Error soft deleting record:', error);
        toast.error('Erro ao apagar registo');
        return false;
      }
      
      const recordType = getRecordTypeLabel(tableName);
      toast.success(`${recordType}${recordName ? ` "${recordName}"` : ''} movido para a reciclagem`);
      return true;
    } catch (error) {
      console.error('Error soft deleting record:', error);
      toast.error('Erro ao apagar registo');
      return false;
    } finally {
      setIsDeleting(null);
    }
  };

  const getRecordTypeLabel = (tableName: string): string => {
    const labels: { [key: string]: string } = {
      products: 'Produto',
      categories: 'Categoria',
      clients: 'Cliente',
      suppliers: 'Fornecedor',
      orders: 'Encomenda',
      stock_entries: 'Compra',
      stock_exits: 'Venda',
      expenses: 'Despesa'
    };
    
    return labels[tableName] || 'Registo';
  };

  return {
    softDelete,
    isDeleting
  };
};

export default useSoftDelete;