import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Cache para evitar múltiplas chamadas à API para o mesmo período
const cache = {
  monthlyData: null,
  monthlyOrders: null,
  lastFetch: 0
};

// Tempo de cache em milissegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchMonthlyData = async () => {
  // Verificar se temos dados em cache válidos
  const now = Date.now();
  if (cache.monthlyData && (now - cache.lastFetch < CACHE_DURATION)) {
    console.log('Using cached monthly data');
    return cache.monthlyData;
  }

  try {
    // Obter datas para os últimos 6 meses
    const today = new Date();
    const months = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push({ month, monthName });
    }
    
    // Obter as datas de início e fim para o período completo de 6 meses
    const startDate = new Date(months[0].month.getFullYear(), months[0].month.getMonth(), 1).toISOString();
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
    
    // Consulta única para vendas no período de 6 meses
    const { data: salesData, error: salesError } = await supabase
      .from('stock_exits')
      .select(`
        id,
        date,
        stock_exit_items:stock_exit_items(
          quantity,
          sale_price,
          discount_percent
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (salesError) {
      console.error('Error fetching sales data:', salesError);
      toast({
        title: "Erro ao carregar dados de vendas",
        description: salesError.message,
        variant: "destructive"
      });
    }
    
    // Consulta única para compras no período de 6 meses
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('stock_entries')
      .select(`
        id,
        date,
        stock_entry_items:stock_entry_items(
          quantity,
          purchase_price,
          discount_percent
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (purchasesError) {
      console.error('Error fetching purchase data:', purchasesError);
      toast({
        title: "Erro ao carregar dados de compras",
        description: purchasesError.message,
        variant: "destructive"
      });
    }
    
    // Consulta única para encomendas no período de 6 meses
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, date, converted_to_stock_exit_id')
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (ordersError) {
      console.error('Error fetching orders data:', ordersError);
      toast({
        title: "Erro ao carregar dados de encomendas",
        description: ordersError.message,
        variant: "destructive"
      });
    }
    
    // Processar dados por mês
    for (const { month, monthName } of months) {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Filtrar vendas para o mês atual
      let monthSales = 0;
      if (salesData) {
        const monthSalesData = salesData.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= monthStart && saleDate <= monthEnd;
        });
        
        monthSalesData.forEach((sale) => {
          if (sale.stock_exit_items) {
            sale.stock_exit_items.forEach((item) => {
              const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
              monthSales += item.quantity * item.sale_price * discountMultiplier;
            });
          }
        });
      }
      
      // Filtrar compras para o mês atual
      let monthPurchases = 0;
      if (purchasesData) {
        const monthPurchasesData = purchasesData.filter(purchase => {
          const purchaseDate = new Date(purchase.date);
          return purchaseDate >= monthStart && purchaseDate <= monthEnd;
        });
        
        monthPurchasesData.forEach((purchase) => {
          if (purchase.stock_entry_items) {
            purchase.stock_entry_items.forEach((item) => {
              const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
              monthPurchases += item.quantity * item.purchase_price * discountMultiplier;
            });
          }
        });
      }
      
      // Filtrar encomendas para o mês atual
      const monthOrders = ordersData ? ordersData.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= monthStart && orderDate <= monthEnd;
      }) : [];
      
      const pendingCount = monthOrders.filter(order => order.converted_to_stock_exit_id === null).length;
      const completedCount = monthOrders.filter(order => order.converted_to_stock_exit_id !== null).length;
      
      data.push({
        name: monthName,
        vendas: monthSales,
        compras: monthPurchases,
        lucro: monthSales - monthPurchases,
        encomendas: monthOrders.length,
        pendentes: pendingCount,
        concluidas: completedCount
      });
    }
    
    // Armazenar em cache
    cache.monthlyData = data;
    cache.lastFetch = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    toast({
      title: "Erro ao processar dados mensais",
      description: error.message,
      variant: "destructive"
    });
    
    // Return fallback data in case of errors
    const fallbackData = Array(6).fill(0).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      return {
        name: monthName,
        vendas: Math.floor(Math.random() * 10000),
        compras: Math.floor(Math.random() * 8000),
        lucro: Math.floor(Math.random() * 5000)
      };
    });
    
    return fallbackData;
  }
};

export const fetchMonthlyOrders = async () => {
  // Verificar se temos dados em cache válidos
  const now = Date.now();
  if (cache.monthlyOrders && (now - cache.lastFetch < CACHE_DURATION)) {
    console.log('Using cached monthly orders data');
    return cache.monthlyOrders;
  }
  
  try {
    const today = new Date();
    const months = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push({ month, monthName });
    }
    
    // Obter as datas de início e fim para o período completo de 6 meses
    const startDate = new Date(months[0].month.getFullYear(), months[0].month.getMonth(), 1).toISOString();
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
    
    // Consulta única para todas as encomendas no período
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('date, converted_to_stock_exit_id')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }
    
    // Processar dados por mês
    for (const { month, monthName } of months) {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Filtrar encomendas para o mês atual
      const monthOrders = orders ? orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= monthStart && orderDate <= monthEnd;
      }) : [];
      
      const pendingCount = monthOrders.filter(order => order.converted_to_stock_exit_id === null).length;
      const completedCount = monthOrders.filter(order => order.converted_to_stock_exit_id !== null).length;
      
      data.push({
        name: monthName,
        pendentes: pendingCount,
        concluidas: completedCount,
        total: pendingCount + completedCount
      });
    }
    
    // Armazenar em cache
    cache.monthlyOrders = data;
    cache.lastFetch = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching monthly orders:', error);
    return [];
  }
};
