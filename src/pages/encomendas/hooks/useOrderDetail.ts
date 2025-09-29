
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { ClientWithAddress, Order, StockExit } from '@/types';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for fetching and managing order detail data
 * @param id - The order ID to fetch details for
 */
export const useOrderDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const { orders, clients, stockExits, isLoading } = useData();
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<ClientWithAddress | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [relatedStockExit, setRelatedStockExit] = useState<StockExit | null>(null);

  useEffect(() => {
    // Don't proceed if still loading data
    if (isLoading) {
      return;
    }
    
    if (id) {
      const fetchedOrder = orders.find(o => o.id === id);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        
        // Calculate order total
        if (fetchedOrder.items && fetchedOrder.items.length > 0) {
          const sum = fetchedOrder.items.reduce((acc, item) => acc + (item.quantity * item.salePrice), 0);
          setTotalValue(sum);
        }

        // Find related stock exit
        if (fetchedOrder.convertedToStockExitId) {
          const exit = stockExits.find(e => e.id === fetchedOrder.convertedToStockExitId);
          if (exit) {
            setRelatedStockExit(exit);
          }
        }
        
        // Find client
        if (fetchedOrder.clientId) {
          const foundClient = clients.find(c => c.id === fetchedOrder.clientId);
          if (foundClient) {
            // Create a ClientWithAddress object from the client data
            const clientWithAddress: ClientWithAddress = {
              ...foundClient,
              address: foundClient.address ? {
                street: foundClient.address,
                postalCode: '',
                city: ''
              } : undefined
            };
            setClient(clientWithAddress);
          }
        }
      } else {
        toast({
          title: "Erro",
          description: "Encomenda não encontrada",
          variant: "destructive",
        });
        navigate('/encomendas/consultar');
      }
    }
  }, [id, orders, clients, navigate, stockExits, isLoading]);

  return {
    order,
    client,
    totalValue,
    relatedStockExit,
  };
};
