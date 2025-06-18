import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { ClientWithAddress } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useStockExitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, clients } = useData();
  const [stockExit, setStockExit] = useState<any | null>(null);
  const [client, setClient] = useState<ClientWithAddress | null>(null);
  const [totalValue, setTotalValue] = useState(0);

  // Function to clean notes from the English "Converted from order" text
  const cleanNotes = (notes: string | undefined): string => {
    if (!notes) return '';
    // Remove the English text "Converted from order X" completely
    return notes.replace(/Converted from order \d+\/\d+\s*/g, '').trim();
  };

  useEffect(() => {
    if (id) {
      const exit = stockExits.find(exit => exit.id === id);
      if (exit) {
        // Clean notes immediately to avoid showing English text
        const cleanedExit = { ...exit, notes: cleanNotes(exit.notes) };
        setStockExit(cleanedExit);
        
        // Calculate total
        if (cleanedExit.items && cleanedExit.items.length > 0) {
          const sum = cleanedExit.items.reduce((acc, item) => acc + (item.quantity * item.salePrice), 0);
          setTotalValue(sum);
        }
        
        // Check if the exit has a clientId and fetch the corresponding client
        if (cleanedExit.clientId) {
          const foundClient = clients.find(c => c.id === cleanedExit.clientId);
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
          description: "Venda não encontrada",
          variant: "destructive",
        });
        navigate('/saidas/historico');
      }
    }
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
    id
  };
};
