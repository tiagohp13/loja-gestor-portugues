import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getClientTotalSpent } from '@/integrations/supabase/utils/financialUtils';
import { mapDbClientToClient } from '@/utils/mappers';
import { Client } from '@/types';

export interface TopClient extends Client {
  totalSpent: number;
}

export const useTopClients = () => {
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopClients = async () => {
    setIsLoading(true);
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return;
      }

      if (!clientsData || clientsData.length === 0) {
        setTopClients([]);
        return;
      }

      // Map to frontend format and get total spent for each client
      const formattedClients = clientsData.map(mapDbClientToClient);
      
      const clientsWithTotals = await Promise.all(
        formattedClients.map(async (client) => {
          const totalSpent = await getClientTotalSpent(client.id);
          return {
            ...client,
            totalSpent
          };
        })
      );

      // Sort by total spent (highest first) and take top 5
      const sortedClients = clientsWithTotals
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      setTopClients(sortedClients);
    } catch (error) {
      console.error('Error fetching top clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopClients();
  }, []);

  return {
    topClients,
    isLoading,
    refetch: fetchTopClients
  };
};