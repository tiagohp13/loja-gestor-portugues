import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { ClientWithAddress } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapDbStockExitToStockExit, mapDbStockExitItemToStockExitItem } from '@/utils/mappers';

export const useStockExitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, clients } = useData();
  const [stockExit, setStockExit] = useState<any | null>(null);
  const [client, setClient] = useState<ClientWithAddress | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [isDeleted, setIsDeleted] = useState(false);

  // Function to clean notes from any "Converted from order" text (including codes with letters)
  const cleanNotes = (notes: string | undefined): string => {
    if (!notes) return '';
    // Remove any "Converted from order <identifier>" up to the line break
    return notes.replace(/Converted from order[^\n]*\n?/g, '').trim();
  };

  useEffect(() => {
    const fetchStockExit = async () => {
      if (!id) return;

      // Try to find in context first
      let exit = stockExits.find(exit => exit.id === id);
      
      // If not found, fetch from database (including deleted)
      if (!exit) {
        try {
          const { data, error } = await supabase
            .from('stock_exits')
            .select(`
              *,
              stock_exit_items(*)
            `)
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            const items = data.stock_exit_items || [];
            exit = mapDbStockExitToStockExit(data, items);
            setIsDeleted(data.status === 'deleted');
          }
        } catch (error) {
          console.error('Error fetching deleted stock exit:', error);
          toast({
            title: 'Erro',
            description: 'Venda não encontrada',
            variant: 'destructive',
          });
          navigate('/saidas/historico');
          return;
        }
      }

      if (exit) {
        // Clean notes immediately to avoid showing English text
        const cleanedExit = { ...exit, notes: cleanNotes(exit.notes) };
        setStockExit(cleanedExit);
        
        // Calculate total
        if (cleanedExit.items && cleanedExit.items.length > 0) {
          const sum = cleanedExit.items.reduce((acc, item) => acc + (item.quantity * item.salePrice), 0);
          setTotalValue(sum);
        }
        
        // Fetch and set client
        if (cleanedExit.clientId) {
          const foundClient = clients.find(c => c.id === cleanedExit.clientId);
          if (foundClient) {
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

    fetchStockExit();
  }, [id, stockExits, navigate, clients]);

  const handleViewClient = () => {
    if (client) {
      navigate(`/clientes/${client.id}`);
    }
  };

  const handleViewOrder = () => {
    if (stockExit && stockExit.fromOrderId) {
      navigate(`/encomendas/${stockExit.fromOrderId}`);
    }
  };

  return {
    stockExit,
    client,
    totalValue,
    cleanNotes,
    handleViewClient,
    handleViewOrder,
    navigate,
    id,
    isDeleted
  };
};
