
import { StockExit, StockEntry } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Calculate total sales value from stock exits
 */
export const calculateTotalSalesValue = (stockExits: StockExit[]): number => {
  return stockExits.reduce((total, exit) => {
    const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
    return total + exitTotal;
  }, 0);
};

/**
 * Calculate total purchase value from stock entries
 */
export const calculateTotalPurchaseValue = (stockEntries: StockEntry[]): number => {
  return stockEntries.reduce((total, entry) => {
    const entryTotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    return total + entryTotal;
  }, 0);
};

/**
 * Calculate total expenses value from expenses table
 */
export const calculateTotalExpensesValue = async (): Promise<number> => {
  try {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        id,
        discount,
        expense_items(
          quantity,
          unit_price,
          discount_percent
        )
      `)
      .is('deleted_at', null);
      
    if (error) {
      console.error('Error fetching expenses:', error);
      return 0;
    }
    
    if (!expenses) return 0;
    
    return expenses.reduce((total, expense) => {
      const expenseItemsTotal = (expense.expense_items || []).reduce((sum: number, item: any) => {
        const itemTotal = item.quantity * item.unit_price;
        const discountAmount = itemTotal * ((item.discount_percent || 0) / 100);
        return sum + (itemTotal - discountAmount);
      }, 0);
      
      // Apply expense-level discount
      const finalTotal = expenseItemsTotal * (1 - (expense.discount || 0) / 100);
      return total + finalTotal;
    }, 0);
  } catch (error) {
    console.error('Error calculating total expenses:', error);
    return 0;
  }
};

/**
 * Calculate total spent (purchases + expenses)
 */
export const calculateTotalSpent = async (stockEntries: StockEntry[]): Promise<number> => {
  const purchasesValue = calculateTotalPurchaseValue(stockEntries);
  const expensesValue = await calculateTotalExpensesValue();
  return purchasesValue + expensesValue;
};

/**
 * Calculate profit (sales minus purchases and expenses)
 */
export const calculateTotalProfitWithExpenses = async (totalSalesValue: number, stockEntries: StockEntry[]): Promise<number> => {
  const totalSpent = await calculateTotalSpent(stockEntries);
  return totalSalesValue - totalSpent;
};

/**
 * Calculate profit (sales minus purchases)
 */
export const calculateTotalProfit = (totalSalesValue: number, totalPurchaseValue: number): number => {
  return totalSalesValue - totalPurchaseValue;
};

/**
 * Calculate profit margin as percentage of sales (including expenses)
 */
export const calculateProfitMarginPercentWithExpenses = async (totalSalesValue: number, stockEntries: StockEntry[]): Promise<number> => {
  if (totalSalesValue === 0) return 0;
  const totalProfit = await calculateTotalProfitWithExpenses(totalSalesValue, stockEntries);
  return (totalProfit / totalSalesValue) * 100;
};

/**
 * Calculate profit margin as percentage of sales
 */
export const calculateProfitMarginPercent = (totalProfit: number, totalSalesValue: number): number => {
  return totalSalesValue > 0 ? (totalProfit / totalSalesValue) * 100 : 0;
};

/**
 * Calculate ROI in monetary value (profit / total spent including expenses)
 */
export const calculateRoiValueWithExpenses = async (totalSalesValue: number, stockEntries: StockEntry[]): Promise<number> => {
  const totalSpent = await calculateTotalSpent(stockEntries);
  if (totalSpent === 0) return 0;
  const totalProfit = await calculateTotalProfitWithExpenses(totalSalesValue, stockEntries);
  return totalProfit / totalSpent;
};

/**
 * Calculate ROI as percentage (including expenses)
 */
export const calculateRoiPercentWithExpenses = async (totalSalesValue: number, stockEntries: StockEntry[]): Promise<number> => {
  const totalSpent = await calculateTotalSpent(stockEntries);
  if (totalSpent === 0) return 0;
  const totalProfit = await calculateTotalProfitWithExpenses(totalSalesValue, stockEntries);
  return (totalProfit / totalSpent) * 100;
};

/**
 * Calculate ROI in monetary value (profit / purchases)
 */
export const calculateRoiValue = (totalProfit: number, totalPurchaseValue: number): number => {
  return totalPurchaseValue > 0 ? totalProfit / totalPurchaseValue : 0;
};

/**
 * Calculate ROI as percentage
 */
export const calculateRoiPercent = (totalProfit: number, totalPurchaseValue: number): number => {
  return totalPurchaseValue > 0 ? (totalProfit / totalPurchaseValue) * 100 : 0;
};

/**
 * Calculate average sale value per sale
 */
export const calculateAverageSaleValue = (totalSalesValue: number, salesCount: number): number => {
  return salesCount > 0 ? totalSalesValue / salesCount : 0;
};

/**
 * Calculate average profit per sale (including expenses)
 */
export const calculateAverageProfitPerSaleWithExpenses = async (totalSalesValue: number, stockEntries: StockEntry[], salesCount: number): Promise<number> => {
  if (salesCount === 0) return 0;
  const totalProfit = await calculateTotalProfitWithExpenses(totalSalesValue, stockEntries);
  return totalProfit / salesCount;
};

/**
 * Calculate average profit per sale
 */
export const calculateAverageProfitPerSale = (totalProfit: number, salesCount: number): number => {
  return salesCount > 0 ? totalProfit / salesCount : 0;
};

/**
 * Get monthly expenses data for charts
 */
export const getMonthlyExpensesData = async () => {
  try {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        date,
        discount,
        expense_items(
          quantity,
          unit_price,
          discount_percent
        )
      `)
      .is('deleted_at', null)
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching monthly expenses:', error);
      return {};
    }
    
    if (!expenses) return {};
    
    const monthlyData: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const expenseTotal = (expense.expense_items || []).reduce((sum: number, item: any) => {
        const itemTotal = item.quantity * item.unit_price;
        const discountAmount = itemTotal * ((item.discount_percent || 0) / 100);
        return sum + (itemTotal - discountAmount);
      }, 0);
      
      const finalTotal = expenseTotal * (1 - (expense.discount || 0) / 100);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + finalTotal;
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error getting monthly expenses data:', error);
    return {};
  }
};
