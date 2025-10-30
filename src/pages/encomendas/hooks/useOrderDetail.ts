
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrdersQuery } from '@/hooks/queries/useOrders';
import { useClientsQuery } from '@/hooks/queries/useClients';
import { useStockExitsQuery } from '@/hooks/queries/useStockExits';
import { ClientWithAddress, Order, StockExit } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapDbOrderToOrder } from '@/utils/mappers';

/**
 * Hook for fetching and managing order detail data
 * @param id - The order ID to fetch details for
 */
export const useOrderDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const { orders, isLoading: ordersLoading } = useOrdersQuery();
  const { clients, isLoading: clientsLoading } = useClientsQuery();
  const { stockExits, isLoading: exitsLoading } = useStockExitsQuery();
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<ClientWithAddress | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [relatedStockExit, setRelatedStockExit] = useState<StockExit | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      // Don't proceed if still loading data
      if (ordersLoading || clientsLoading || exitsLoading) {
        return;
      }
      
      if (!id) return;

      let fetchedOrder = orders.find(o => o.id === id);
      
      // If not found, fetch from database (including deleted)
      if (!fetchedOrder) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              order_items(*)
            `)
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            const items = data.order_items || [];
            fetchedOrder = mapDbOrderToOrder(data, items);
            setIsDeleted(data.status === 'deleted');
          }
        } catch (error) {
          console.error('Error fetching deleted order:', error);
          toast({
            title: "Erro",
            description: "Encomenda não encontrada",
            variant: "destructive",
          });
          navigate('/encomendas/consultar');
          return;
        }
      }

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
      }
    };

    fetchOrder();
  }, [id, orders, clients, navigate, stockExits, ordersLoading, clientsLoading, exitsLoading]);

  return {
    order,
    client,
    totalValue,
    relatedStockExit,
    isDeleted,
  };
};
