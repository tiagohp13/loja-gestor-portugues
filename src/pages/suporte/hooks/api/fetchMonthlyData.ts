
import { supabase } from '@/integrations/supabase/client';

export const fetchMonthlyData = async (startDate?: string, endDate?: string) => {
  const today = new Date();
  let startMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  let endMonth = today;
  
  // Apply date range filtering if provided
  if (startDate) {
    startMonth = new Date(startDate);
  }
  
  if (endDate) {
    endMonth = new Date(endDate);
  }
  
  const months = [];
  const data = [];
  
  // Calculate number of months to show
  const monthDiff = (endMonth.getFullYear() - startMonth.getFullYear()) * 12 + (endMonth.getMonth() - startMonth.getMonth());
  const monthsToShow = Math.min(Math.max(monthDiff + 1, 1), 12); // Show at least 1 month and at most 12 months
  
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const month = new Date(endMonth.getFullYear(), endMonth.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    months.push({ month, monthName });
  }
  
  for (const { month, monthName } of months) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();
    
    const { data: sales } = await supabase
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
    
    let monthSales = 0;
    if (sales) {
      sales.forEach((sale: any) => {
        if (sale.stock_exit_items) {
          sale.stock_exit_items.forEach((item: any) => {
            const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
            monthSales += item.quantity * item.sale_price * discountMultiplier;
          });
        }
      });
    }
    
    const { data: purchases } = await supabase
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
    
    let monthPurchases = 0;
    if (purchases) {
      purchases.forEach((purchase: any) => {
        if (purchase.stock_entry_items) {
          purchase.stock_entry_items.forEach((item: any) => {
            const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
            monthPurchases += item.quantity * item.purchase_price * discountMultiplier;
          });
        }
      });
    }
    
    const { data: orders, count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .gte('date', startDate)
      .lte('date', endDate);
    
    data.push({
      name: monthName,
      vendas: monthSales,
      compras: monthPurchases,
      lucro: monthSales - monthPurchases,
      encomendas: orderCount || 0
    });
  }
  
  return data;
};

export const fetchMonthlyOrders = async (startDate?: string, endDate?: string) => {
  const today = new Date();
  let startMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  let endMonth = today;
  
  // Apply date range filtering if provided
  if (startDate) {
    startMonth = new Date(startDate);
  }
  
  if (endDate) {
    endMonth = new Date(endDate);
  }
  
  const months = [];
  const data = [];
  
  // Calculate number of months to show
  const monthDiff = (endMonth.getFullYear() - startMonth.getFullYear()) * 12 + (endMonth.getMonth() - startMonth.getMonth());
  const monthsToShow = Math.min(Math.max(monthDiff + 1, 1), 12); // Show at least 1 month and at most 12 months
  
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const month = new Date(endMonth.getFullYear(), endMonth.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    months.push({ month, monthName });
  }
  
  for (const { month, monthName } of months) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();
    
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .is('converted_to_stock_exit_id', null)
      .gte('date', startDate)
      .lte('date', endDate);
    
    const { count: completedCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .not('converted_to_stock_exit_id', 'is', null)
      .gte('date', startDate)
      .lte('date', endDate);
    
    data.push({
      name: monthName,
      pendentes: pendingCount || 0,
      concluidas: completedCount || 0,
      total: (pendingCount || 0) + (completedCount || 0)
    });
  }
  
  return data;
};
