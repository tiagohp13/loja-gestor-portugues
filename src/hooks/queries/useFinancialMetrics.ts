import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

interface FinancialMetrics {
  totalSpent: number;
  totalProfit: number;
  profitMargin: number;
  roi: number;
  monthlyExpenses: Record<string, number>;
}

const fetchFinancialMetrics = async (): Promise<FinancialMetrics> => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Fetch all data in parallel with a single query per table
  const [expensesResult, stockEntriesResult, stockExitsResult] = await Promise.all([
    supabase
      .from('expenses')
      .select(`
        date,
        discount,
        expense_items(quantity, unit_price, discount_percent)
      `)
      .is('deleted_at', null)
      .eq('status', 'active'),
    
    supabase
      .from('stock_entries')
      .select(`
        date,
        stock_entry_items(quantity, purchase_price, discount_percent)
      `)
      .is('deleted_at', null)
      .eq('status', 'active'),
    
    supabase
      .from('stock_exits')
      .select(`
        stock_exit_items(quantity, sale_price, discount_percent)
      `)
      .is('deleted_at', null)
      .eq('status', 'active')
  ]);

  if (expensesResult.error) throw expensesResult.error;
  if (stockEntriesResult.error) throw stockEntriesResult.error;
  if (stockExitsResult.error) throw stockExitsResult.error;

  // Calculate total expenses
  const totalExpenses = (expensesResult.data || []).reduce((sum, expense) => {
    const itemsTotal = (expense.expense_items || []).reduce((itemSum, item) => {
      const itemValue = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
      return itemSum + itemValue;
    }, 0);
    return sum + itemsTotal * (1 - (expense.discount || 0) / 100);
  }, 0);

  // Calculate total purchases
  const totalPurchases = (stockEntriesResult.data || []).reduce((sum, entry) => {
    const itemsTotal = (entry.stock_entry_items || []).reduce((itemSum, item) => {
      const itemValue = item.quantity * item.purchase_price * (1 - (item.discount_percent || 0) / 100);
      return itemSum + itemValue;
    }, 0);
    return sum + itemsTotal;
  }, 0);

  // Calculate total sales
  const totalSales = (stockExitsResult.data || []).reduce((sum, exit) => {
    const itemsTotal = (exit.stock_exit_items || []).reduce((itemSum, item) => {
      const itemValue = item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);
      return itemSum + itemValue;
    }, 0);
    return sum + itemsTotal;
  }, 0);

  const totalSpent = totalPurchases + totalExpenses;
  const totalProfit = totalSales - totalSpent;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const roi = totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0;

  // Calculate monthly expenses
  const monthlyExpenses: Record<string, number> = {};
  (expensesResult.data || []).forEach((expense) => {
    const month = format(new Date(expense.date), 'yyyy-MM');
    const itemsTotal = (expense.expense_items || []).reduce((sum, item) => {
      return sum + item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
    }, 0);
    const expenseTotal = itemsTotal * (1 - (expense.discount || 0) / 100);
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expenseTotal;
  });

  return {
    totalSpent,
    totalProfit,
    profitMargin,
    roi,
    monthlyExpenses
  };
};

export const useFinancialMetrics = () => {
  return useQuery({
    queryKey: ['financialMetrics'],
    queryFn: fetchFinancialMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
