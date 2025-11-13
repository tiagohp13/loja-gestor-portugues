import { supabase, countPendingOrders, getLowStockProducts } from '@/integrations/supabase/client';
import { calculateRoiPercent, calculateProfitMarginPercent } from '@/pages/dashboard/hooks/utils/financialUtils';
import { fetchMonthlyData, fetchMonthlyOrders } from './fetchMonthlyData';
import { SupportStats, LowStockProduct } from '../../types/supportTypes';
import { toast } from '@/components/ui/use-toast';

// Cache para armazenar os resultados das consultas
const cache = {
  supportStats: null as SupportStats | null,
  lastFetch: 0
};

// Cache de 10 minutos para melhor performance
const CACHE_DURATION = 10 * 60 * 1000;

export const fetchSupportStats = async (): Promise<SupportStats> => {
  // Verificar se temos dados em cache válidos
  const now = Date.now();
  if (cache.supportStats && (now - cache.lastFetch < CACHE_DURATION)) {
    return cache.supportStats;
  }

  try {
    // Query otimizada: buscar apenas IDs de exits ativas primeiro
    const { data: activeExits, error: exitsError } = await supabase
      .from('stock_exits')
      .select('id')
      .is('deleted_at', null);
    
    let totalSales = 0;
    let completedExitsCount = 0; // Número de vendas (saídas concluídas)
    if (activeExits && activeExits.length > 0 && !exitsError) {
      completedExitsCount = activeExits.length; // Contar vendas ativas
      // Depois buscar todos os items de uma vez
      const exitIds = activeExits.map(e => e.id);
      const { data: exitItems, error: exitError } = await supabase
        .from('stock_exit_items')
        .select('quantity, sale_price, discount_percent')
        .in('exit_id', exitIds);
      
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
    } else if (exitsError) {
      console.error('Error fetching active exits:', exitsError);
    }
    
    // Query otimizada: buscar apenas IDs de entries ativas primeiro
    const { data: activeEntries, error: entriesError } = await supabase
      .from('stock_entries')
      .select('id')
      .is('deleted_at', null);
    
    let totalPurchases = 0;
    if (activeEntries && activeEntries.length > 0 && !entriesError) {
      // Depois buscar todos os items de uma vez
      const entryIds = activeEntries.map(e => e.id);
      const { data: entryItems, error: entryError } = await supabase
        .from('stock_entry_items')
        .select('quantity, purchase_price, discount_percent')
        .in('entry_id', entryIds);
      
      if (entryItems && !entryError) {
        totalPurchases = entryItems.reduce((sum, item) => {
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
    } else if (entriesError) {
      console.error('Error fetching active entries:', entriesError);
    }
    
    // Consulta para despesas ativas (incluindo desconto a nível de despesa)
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select(`
        discount,
        expense_items(
          quantity,
          unit_price,
          discount_percent
        )
      `)
      .is('deleted_at', null);
      
    let totalExpenses = 0;
    let numberOfExpenses = 0;
    if (expenses && !expenseError) {
      numberOfExpenses = expenses.length; // Contar o número de despesas
      totalExpenses = expenses.reduce((sum, expense) => {
        const expenseItemsTotal = (expense.expense_items || []).reduce((itemSum: number, item: any) => {
          const itemTotal = item.quantity * item.unit_price;
          const itemDiscountAmount = itemTotal * ((item.discount_percent || 0) / 100);
          return itemSum + (itemTotal - itemDiscountAmount);
        }, 0);
        
        // Apply expense-level discount
        const finalExpenseTotal = expenseItemsTotal * (1 - (expense.discount || 0) / 100);
        return sum + finalExpenseTotal;
      }, 0);
    } else if (expenseError) {
      console.error('Error fetching expense items:', expenseError);
      toast({
        title: "Erro ao carregar dados de despesas",
        description: expenseError.message,
        variant: "destructive"
      });
    }
    
    // Total gasto = compras + despesas
    const totalSpent = totalPurchases + totalExpenses;
    const profit = totalSales - totalSpent;
    
    // Calculate profit margin using real data including expenses
    const profitMargin = calculateProfitMarginPercent(profit, totalSales);
    
    // Executando apenas consultas essenciais para melhorar performance
    const [
      topProducts,
      topClients,
      topSuppliers,
      lowStockProductsData,
      pendingOrders,
      clientsCount,
      productsCount,
      monthlyData,
      monthlyOrders
    ] = await Promise.all([
      fetchTopProducts(),
      fetchTopClients(),
      fetchTopSuppliers(),
      fetchLowStockProducts(),
      countPendingOrders(),
      fetchClientsCount(),
      fetchProductsCount(),
      fetchMonthlyData(),
      fetchMonthlyOrders()
    ]);
    
    // Calculate derived values instead of additional queries
    const completedCount = 0; // Will be calculated from orders if needed
    const suppliersCount = topSuppliers.length; // Approximation
    const categoriesCount = 0; // Not essential for dashboard
    
    const stats: SupportStats = {
      totalSales,
      totalSpent,
      profit,
      profitMargin,
      topProducts,
      topClients,
      topSuppliers,
      lowStockProducts: lowStockProductsData,
      pendingOrders,
      completedOrders: completedExitsCount, // Usar o número real de vendas
      clientsCount,
      suppliersCount,
      categoriesCount,
      productsCount,
      monthlySales: [],
      monthlyData,
      monthlyOrders,
      // Adicionando o número de despesas para o cálculo do KPI
      numberOfExpenses
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
    // Usar abordagem direta ao invés de RPC - apenas saídas ativas
    const { data: clientExits, error: exitError } = await supabase
      .from('stock_exits')
      .select('client_name, client_id')
      .is('deleted_at', null)
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
      .is('deleted_at', null)
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

const fetchLowStockProducts = async (): Promise<LowStockProduct[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, current_stock, min_stock')
      .is('deleted_at', null)
      .lte('current_stock', 10);
    
    if (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
    
    return products?.map(product => ({
      id: product.id,
      name: product.name,
      currentStock: product.current_stock,
      minStock: product.min_stock
    })) || [];
  } catch (error) {
    console.error('Error in fetchLowStockProducts:', error);
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
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);
    
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
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);
    
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
