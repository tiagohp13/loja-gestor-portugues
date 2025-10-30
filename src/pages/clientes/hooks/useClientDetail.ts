
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '@/contexts/ClientsContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useStock } from '@/contexts/StockContext';
import { Client, Order, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDbClientToClient } from '@/utils/mappers';

export const useClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useClients();
  const { orders } = useOrders();
  const { stockExits } = useStock();
  
  const getClient = (id: string) => clients.find(c => c.id === id);
  const getClientHistory = (id: string) => {
    const clientOrders = orders.filter(o => o.clientId === id);
    const clientExits = stockExits.filter(e => e.clientId === id);
    return { orders: clientOrders, exits: clientExits };
  };
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
