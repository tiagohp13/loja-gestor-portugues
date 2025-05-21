import { supabase, countPendingOrders, getLowStockProducts } from '@/integrations/supabase/client';
import { calculateRoiPercent, calculateProfitMarginPercent } from '@/pages/dashboard/hooks/utils/financialUtils';
import { fetchMonthlyData, fetchMonthlyOrders } from './fetchMonthlyData';
import { SupportStats } from '../../types/supportTypes';
import { toast } from '@/components/ui/use-toast';

// Cache para armazenar os resultados das consultas
const cache = {
  supportStats: null,
  lastFetch: 0
};

// Tempo de cache em milissegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchSupportStats = async (): Promise<SupportStats> => {
  // Verificar se temos dados em cache válidos
  const now = Date.now();
  if (cache.supportStats && (now - cache.lastFetch < CACHE_DURATION)) {
    console.log('Using cached support stats');
    return cache.supportStats;
  }

  try {
    // Consulta otimizada para itens de saída de estoque
    const { data: exitItems, error: exitError } = await supabase
      .from('stock_exit_items')
      .select('quantity, sale_price, discount_percent');
      
    let totalSales = 0;
    if (exitItems && !exitError) {
      totalSales = exitItems.reduce((sum, item) => {
        const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
        return sum + (item.quantity * item.sale_price * discountMultiplier);
      }, 0);
    } else if (exitError) {
      console.error('Error fetching exit items:', exitError);
      toast({
        title: "Erro ao carregar dados de vendas",
        description: exitError.message,
        variant: "destructive"
      });
    }
    
    // Consulta otimizada para itens de entrada de estoque
    const { data: entryItems, error: entryError } = await supabase
      .from('stock_entry_items')
      .select('quantity, purchase_price, discount_percent');
      
    let totalSpent = 0;
    if (entryItems && !entryError) {
      totalSpent = entryItems.reduce((sum, item) => {
        const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
        return sum + (item.quantity * item.purchase_price * discountMultiplier);
      }, 0);
    } else if (entryError) {
      console.error('Error fetching entry items:', entryError);
      toast({
        title: "Erro ao carregar dados de compras",
        description: entryError.message,
        variant: "destructive"
      });
    }
    
    const profit = totalSales - totalSpent;
    
    // Calculate profit margin using real data
    const profitMargin = calculateProfitMarginPercent(profit, totalSales);
    
    // Executando consultas em paralelo para melhorar o desempenho
    const [
      topProducts,
      topClients,
      topSuppliers,
      lowStockProducts,
      pendingOrders,
      completedCount,
      clientsCount,
      suppliersCount,
      categoriesCount,
      productsCount,
      monthlyData,
      monthlyOrders
    ] = await Promise.all([
      fetchTopProducts(),
      fetchTopClients(),
      fetchTopSuppliers(),
      getLowStockProducts(),
      countPendingOrders(),
      fetchCompletedOrdersCount(),
      fetchClientsCount(),
      fetchSuppliersCount(),
      fetchCategoriesCount(),
      fetchProductsCount(),
      fetchMonthlyData(),
      fetchMonthlyOrders()
    ]);
    
    const stats: SupportStats = {
      totalSales,
      totalSpent,
      profit,
      profitMargin,
      topProducts,
      topClients,
      topSuppliers,
      lowStockProducts,
      pendingOrders,
      completedOrders: completedCount,
      clientsCount,
      suppliersCount,
      categoriesCount,
      productsCount,
      monthlySales: [],
      monthlyData,
      monthlyOrders
    };
    
    // Armazenar em cache
    cache.supportStats = stats;
    cache.lastFetch = now;
    
    return stats;
  } catch (error) {
    console.error('Error fetching support stats:', error);
    throw error;
  }
};

const fetchTopProducts = async () => {
  try {
    const { data: topProductsData, error: productsError } = await supabase
      .from('stock_exit_items')
      .select('product_name, product_id, quantity')
      .order('quantity', { ascending: false })
      .limit(5);
    
    if (productsError) {
      console.error('Error fetching top products:', productsError);
      return [];
    }
    
    return topProductsData?.map((product) => ({
      name: product.product_name,
      quantity: product.quantity,
      productId: product.product_id
    })) || [];
  } catch (error) {
    console.error('Error in fetchTopProducts:', error);
    return [];
  }
};

// Modificando a função para não usar RPC e retornar o formato correto
const fetchTopClients = async () => {
  try {
    // Usar abordagem direta ao invés de RPC
    const { data: clientExits, error: exitError } = await supabase
      .from('stock_exits')
      .select('client_name, client_id')
      .limit(100);
    
    if (exitError) {
      console.error('Error fetching client exits:', exitError);
      return [];
    }
    
    // Contar as ordens por cliente
    const clientCounts: Record<string, { name: string, orders: number, spending: number }> = {};
    
    clientExits?.forEach(exit => {
      if (exit.client_name) {
        if (!clientCounts[exit.client_name]) {
          clientCounts[exit.client_name] = {
            name: exit.client_name,
            orders: 0,
            spending: 0
          };
        }
        clientCounts[exit.client_name].orders += 1;
      }
    });
    
    // Converter para array, ordenar e limitar a 5
    return Object.values(clientCounts)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);
  } catch (error) {
    console.error('Error in fetchTopClients:', error);
    return [];
  }
};

const fetchTopSuppliers = async () => {
  try {
    const { data: suppliers, error: suppliersError } = await supabase
      .from('stock_entries')
      .select('supplier_name')
      .order('supplier_name');
    
    if (suppliersError || !suppliers) {
      console.error('Error fetching suppliers:', suppliersError);
      return [];
    }
    
    const supplierCounts = suppliers.reduce((acc: Record<string, number>, current) => {
      if (current.supplier_name) {
        acc[current.supplier_name] = (acc[current.supplier_name] || 0) + 1;
      }
      return acc;
    }, {});
    
    return Object.entries(supplierCounts)
      .map(([name, entries]) => ({ name, entries }))
      .sort((a, b) => b.entries - a.entries)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching top suppliers:', error);
    return [];
  }
};

const fetchCompletedOrdersCount = async () => {
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .not('converted_to_stock_exit_id', 'is', null);
    
    if (error) {
      console.error('Error fetching completed orders count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in fetchCompletedOrdersCount:', error);
    return 0;
  }
};

const fetchClientsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching clients count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in fetchClientsCount:', error);
    return 0;
  }
};

const fetchSuppliersCount = async () => {
  try {
    const { count, error } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching suppliers count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in fetchSuppliersCount:', error);
    return 0;
  }
};

const fetchCategoriesCount = async () => {
  try {
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching categories count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in fetchCategoriesCount:', error);
    return 0;
  }
};

const fetchProductsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching products count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in fetchProductsCount:', error);
    return 0;
  }
};
