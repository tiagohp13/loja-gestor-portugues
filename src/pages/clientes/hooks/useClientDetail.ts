
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Client, Order, StockExit } from '@/types';

export const useClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, getClientHistory } = useData();
  const [client, setClient] = useState<Client | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [clientExits, setClientExits] = useState<StockExit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    const fetchData = () => {
      const foundClient = getClient(id);
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

    fetchData();
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
  };
};

export default useClientDetail;
