import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getClientTotalSpent } from '@/integrations/supabase/utils/financialUtils';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'client' | 'product' | 'order' | 'sale' | 'supplier';
  url: string;
}

export interface GroupedSearchResults {
  clients: SearchResult[];
  products: SearchResult[];
  orders: SearchResult[];
  sales: SearchResult[];
  suppliers: SearchResult[];
}

export const useGlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedSearchResults>({
    clients: [],
    products: [],
    orders: [],
    sales: [],
    suppliers: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const searchClients = async (searchTerm: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email, phone')
      .neq('status', 'deleted')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) {
      console.error('Error searching clients:', error);
      return [];
    }

    return (data || []).map(client => ({
      id: client.id,
      title: client.name,
      subtitle: client.email || client.phone || undefined,
      type: 'client' as const,
      url: `/clientes/${client.id}`
    }));
  };

  const searchProducts = async (searchTerm: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, code, category')
      .neq('status', 'deleted')
      .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return (data || []).map(product => ({
      id: product.id,
      title: product.name,
      subtitle: `Código: ${product.code}${product.category ? ` | ${product.category}` : ''}`,
      type: 'product' as const,
      url: `/produtos/${product.id}`
    }));
  };

  const searchOrders = async (searchTerm: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, number, client_name, date')
      .neq('status', 'deleted')
      .or(`number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) {
      console.error('Error searching orders:', error);
      return [];
    }

    return (data || []).map(order => ({
      id: order.id,
      title: `Encomenda ${order.number}`,
      subtitle: `Cliente: ${order.client_name} | ${new Date(order.date).toLocaleDateString('pt-PT')}`,
      type: 'order' as const,
      url: `/encomendas/${order.id}`
    }));
  };

  const searchSales = async (searchTerm: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('stock_exits')
      .select('id, number, client_name, date')
      .neq('status', 'deleted')
      .or(`number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) {
      console.error('Error searching sales:', error);
      return [];
    }

    return (data || []).map(sale => ({
      id: sale.id,
      title: `Venda ${sale.number}`,
      subtitle: `Cliente: ${sale.client_name} | ${new Date(sale.date).toLocaleDateString('pt-PT')}`,
      type: 'sale' as const,
      url: `/saidas/${sale.id}`
    }));
  };

  const searchSuppliers = async (searchTerm: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, email, phone')
      .neq('status', 'deleted')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) {
      console.error('Error searching suppliers:', error);
      return [];
    }

    return (data || []).map(supplier => ({
      id: supplier.id,
      title: supplier.name,
      subtitle: supplier.email || supplier.phone || undefined,
      type: 'supplier' as const,
      url: `/fornecedores/${supplier.id}`
    }));
  };

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults({
        clients: [],
        products: [],
        orders: [],
        sales: [],
        suppliers: []
      });
      return;
    }

    setIsLoading(true);

    try {
      const [clients, products, orders, sales, suppliers] = await Promise.all([
        searchClients(searchTerm),
        searchProducts(searchTerm),
        searchOrders(searchTerm),
        searchSales(searchTerm),
        searchSuppliers(searchTerm)
      ]);

      setResults({
        clients,
        products,
        orders,
        sales,
        suppliers
      });
    } catch (error) {
      console.error('Error performing global search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults({
      clients: [],
      products: [],
      orders: [],
      sales: [],
      suppliers: []
    });
  };

  const hasResults = Object.values(results).some(arr => arr.length > 0);

  return {
    query,
    setQuery,
    results,
    isLoading,
    hasResults,
    clearSearch
  };
};