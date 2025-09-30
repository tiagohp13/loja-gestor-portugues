
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Client, Order, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDbClientToClient } from '@/utils/mappers';

export const useClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, getClientHistory } = useData();
  const [client, setClient] = useState<Client | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [clientExits, setClientExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
    
      setIsLoading(true);
      
      let foundClient = getClient(id);
      
      // If not found in context, try to fetch from database (including deleted)
      if (!foundClient) {
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            foundClient = mapDbClientToClient(data);
            setIsDeleted(data.status === 'deleted');
          }
        } catch (error) {
          console.error('Error fetching deleted client:', error);
          setIsLoading(false);
          return;
        }
      }

      if (!foundClient) {
        setIsLoading(false);
        return;
      }

      setClient(foundClient);
      
      const history = getClientHistory(id);
      setClientOrders(history.orders);
      setClientExits(history.exits);
      
      setIsLoading(false);
    };

    fetchClient();
  }, [id, getClient, getClientHistory]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    client,
    clientOrders,
    clientExits,
    isLoading,
    handleNavigate,
    isDeleted,
  };
};

export default useClientDetail;
