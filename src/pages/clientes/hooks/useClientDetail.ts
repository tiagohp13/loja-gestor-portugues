
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientsQuery } from '@/hooks/queries/useClients';
import { useOrdersQuery } from '@/hooks/queries/useOrders';
import { useStockExitsQuery } from '@/hooks/queries/useStockExits';
import { Client, Order, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDbClientToClient } from '@/utils/mappers';

export const useClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, isLoading: clientsLoading } = useClientsQuery();
  const { orders, isLoading: ordersLoading } = useOrdersQuery();
  const { stockExits, isLoading: exitsLoading } = useStockExitsQuery();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [clientExits, setClientExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id || clientsLoading || ordersLoading || exitsLoading) return;
    
      setIsLoading(true);
      
      let foundClient = clients.find(c => c.id === id);
      
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
      
      // Get client history
      const clientOrdersList = orders.filter(o => o.clientId === id);
      const clientExitsList = stockExits.filter(e => e.clientId === id);
      setClientOrders(clientOrdersList);
      setClientExits(clientExitsList);
      
      setIsLoading(false);
    };

    fetchClient();
  }, [id, clients, orders, stockExits, clientsLoading, ordersLoading, exitsLoading]);

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
