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

  // Função para limpar notas da frase em inglês "Converted from order"
  const cleanNotes = (notes: string | undefined): string => {
    if (!notes) return '';
    
    // Remove o texto em inglês "Converted from order X" se presente
    // Este padrão irá capturar variações como "Converted from order ENC-2025/001"
    return notes.replace(/Converted from order .+?\s*/g, '');
  };

  useEffect(() => {
    if (id) {
      const exit = stockExits.find(exit => exit.id === id);
      if (exit) {
        setStockExit(exit);
        
        // Calculate total
        if (exit.items && exit.items.length > 0) {
          const sum = exit.items.reduce((acc, item) => acc + (item.quantity * item.salePrice), 0);
          setTotalValue(sum);
        }
        
        // Check if the exit has a clientId and fetch the corresponding client
        if (exit.clientId) {
          const foundClient = clients.find(c => c.id === exit.clientId);
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
