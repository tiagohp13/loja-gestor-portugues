
import { useData } from '@/contexts/DataContext';

interface UseFiltersProps {
  searchTerm: string;
  clientSearchTerm: string;
}

export const useFilters = ({ searchTerm, clientSearchTerm }: UseFiltersProps) => {
  const { products, clients } = useData();
  
  // Filter products based on search term
  const filteredProducts = searchTerm.trim() === '' ? 
    products :
    products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  // Filter clients based on search term
  const filteredClients = clientSearchTerm.trim() === '' ?
    clients :
    clients.filter(client =>
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.taxId?.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

  return {
    filteredProducts,
    filteredClients
  };
};
