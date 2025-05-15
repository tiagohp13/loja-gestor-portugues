
import { Client, Product } from "@/types";

export const useOrderFilters = (clients: Client[], products: Product[]) => {
  const filterClients = (searchTerm: string) => {
    if (!searchTerm) return clients;
    
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.taxId && client.taxId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  const filterProducts = (searchTerm: string) => {
    if (!searchTerm) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return {
    filterClients,
    filterProducts
  };
};
