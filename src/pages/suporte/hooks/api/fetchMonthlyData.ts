import { supabase } from '@/integrations/supabase/client';

export interface MonthlyDataItem {
  name: string;
  vendas: number;
  compras: number;
  lucro: number;
}

export interface MonthlyOrderItem {
  name: string;
  orders: number;
  completedExits: number;
}

export const fetchMonthlyData = async (): Promise<MonthlyDataItem[]> => {
  try {
    // Get current date and 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    // Fetch sales data
    const { data: salesData, error: salesError } = await supabase
      .from('stock_exit_items')
      .select(`
        quantity,
        sale_price,
        discount_percent,
        stock_exits!inner(date)
      `)
      .gte('stock_exits.date', sixMonthsAgo.toISOString())
      .lte('stock_exits.date', now.toISOString());

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
    }

    // Fetch purchases data
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('stock_entry_items')
      .select(`
        quantity,
        purchase_price,
        discount_percent,
        stock_entries!inner(date)
      `)
      .gte('stock_entries.date', sixMonthsAgo.toISOString())
      .lte('stock_entries.date', now.toISOString());

    if (purchasesError) {
      console.error('Error fetching purchases data:', purchasesError);
    }

    // Fetch expenses data
    const { data: expensesData, error: expensesError } = await supabase
      .from('expense_items')
      .select(`
        quantity,
        unit_price,
        discount_percent,
        expenses!inner(date, discount)
      `)
      .gte('expenses.date', sixMonthsAgo.toISOString())
      .lte('expenses.date', now.toISOString());

    if (expensesError) {
      console.error('Error fetching expenses data:', expensesError);
    }

    // Create monthly data structure
    const monthlyMap = new Map<string, MonthlyDataItem>();
    
    // Initialize months
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthKey = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      monthlyMap.set(monthKey, {
        name: monthKey,
        vendas: 0,
        compras: 0,
        lucro: 0
      });
    }

    // Process sales data
    if (salesData) {
      salesData.forEach((item: any) => {
        const date = new Date(item.stock_exits.date);
        const monthKey = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(monthKey);
        
        if (existing) {
          const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
          const itemValue = item.quantity * item.sale_price * discountMultiplier;
          existing.vendas += itemValue;
        }
      });
    }

    // Process purchases data
    if (purchasesData) {
      purchasesData.forEach((item: any) => {
        const date = new Date(item.stock_entries.date);
        const monthKey = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(monthKey);
        
        if (existing) {
          const discountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
          const itemValue = item.quantity * item.purchase_price * discountMultiplier;
          existing.compras += itemValue;
        }
      });
    }

    // Process expenses data
    if (expensesData) {
      expensesData.forEach((item: any) => {
        const date = new Date(item.expenses.date);
        const monthKey = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(monthKey);
        
        if (existing) {
          const itemDiscountMultiplier = item.discount_percent ? 1 - (item.discount_percent / 100) : 1;
          const itemTotal = item.quantity * item.unit_price * itemDiscountMultiplier;
          
          // Apply expense-level discount
          const expenseDiscountMultiplier = item.expenses.discount ? 1 - (item.expenses.discount / 100) : 1;
          const finalItemValue = itemTotal * expenseDiscountMultiplier;
          
          existing.compras += finalItemValue; // Add expenses to purchases
        }
      });
    }

    // Calculate profit for each month
    monthlyMap.forEach((monthData) => {
      monthData.lucro = monthData.vendas - monthData.compras;
    });

    // Convert to array and sort by date (most recent first)
    return Array.from(monthlyMap.values()).reverse();
    
  } catch (error) {
    console.error('Error in fetchMonthlyData:', error);
    return [];
  }
};

export const fetchMonthlyOrders = async (): Promise<MonthlyOrderItem[]> => {
  try {
    // Get current date and 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    // Fetch orders data
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        date,
        converted_to_stock_exit_id
      `)
      .gte('date', sixMonthsAgo.toISOString())
      .lte('date', now.toISOString());

    if (ordersError) {
      console.error('Error fetching orders data:', ordersError);
      return [];
    }

    // Create monthly data structure
    const monthlyMap = new Map<string, MonthlyOrderItem>();

    // Initialize months
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthKey = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      monthlyMap.set(monthKey, {
        name: monthKey,
        orders: 0,
        completedExits: 0
      });
    }

    // Process orders data
    ordersData.forEach((order: any) => {
      const date = new Date(order.date);
      const monthKey = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      const existing = monthlyMap.get(monthKey);

      if (existing) {
        existing.orders += 1;
        if (order.converted_to_stock_exit_id) {
          existing.completedExits += 1;
        }
      }
    });

    // Convert to array and sort by date (most recent first)
    return Array.from(monthlyMap.values()).reverse();

  } catch (error) {
    console.error('Error in fetchMonthlyOrders:', error);
    return [];
  }
};
