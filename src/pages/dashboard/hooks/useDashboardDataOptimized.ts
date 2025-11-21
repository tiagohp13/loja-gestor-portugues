import { useProducts } from '@/contexts/ProductsContext';
import { useStock } from '@/contexts/StockContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ensureDate, 
  createMonthlyDataMap, 
  processExitsForMonthlyData,
  processEntriesForMonthlyData 
} from './utils/dateUtils';
import { 
  identifyLowStockProducts,
  calculateTotalStockValue
} from './utils/productUtils';
import { 
  calculateTotalSalesValue,
  calculateTotalPurchaseValue,
  calculateTotalSpent,
  calculateTotalProfitWithExpenses,
  calculateProfitMarginPercentWithExpenses,
  getMonthlyExpensesData
} from './utils/financialUtils';

export const useDashboardDataOptimized = () => {
  const { products } = useProducts();
  const { stockEntries, stockExits } = useStock();
  const { orders } = useOrders();
  
  // State for values that include expenses
  const [financialMetrics, setFinancialMetrics] = useState({
    totalSpentWithExpenses: 0,
    totalProfitWithExpenses: 0,
    profitMarginPercentWithExpenses: 0,
    monthlyExpensesData: {} as Record<string, number>
  });

  // Calculate basic financial metrics (memoized for performance)
  const basicFinancials = useMemo(() => ({
    totalSalesValue: calculateTotalSalesValue(stockExits),
    totalPurchaseValue: calculateTotalPurchaseValue(stockEntries),
    totalStockValue: calculateTotalStockValue(products)
  }), [stockExits, stockEntries, products]);

  // Prepare monthly data for charts (optimized)
  const monthlyData = useMemo(() => {
    const dataMap = createMonthlyDataMap();
    processExitsForMonthlyData(stockExits, dataMap);
    processEntriesForMonthlyData(stockEntries, dataMap);
    
    // Add expenses data to monthly chart
    Object.entries(financialMetrics.monthlyExpensesData).forEach(([monthKey, expenseValue]) => {
      const [year, month] = monthKey.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleDateString('pt-PT', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (dataMap.has(monthName)) {
        const existing = dataMap.get(monthName)!;
        existing.compras += expenseValue;
      }
    });
    
    return Array.from(dataMap.values());
  }, [stockExits, stockEntries, financialMetrics.monthlyExpensesData]);
  
  // Calculate low stock products (memoized)
  const lowStockProducts = useMemo(() => {
    return identifyLowStockProducts(products);
  }, [products]);

  // Calculate financial metrics including expenses
  const calculateExpensiveMetrics = useCallback(async () => {
    try {
      const [totalSpent, totalProfitWithExp, profitMarginWithExp, expensesData] = await Promise.all([
        calculateTotalSpent(stockEntries),
        calculateTotalProfitWithExpenses(basicFinancials.totalSalesValue, stockEntries),
        calculateProfitMarginPercentWithExpenses(basicFinancials.totalSalesValue, stockEntries),
        getMonthlyExpensesData()
      ]);
      
      setFinancialMetrics({
        totalSpentWithExpenses: totalSpent,
        totalProfitWithExpenses: totalProfitWithExp,
        profitMarginPercentWithExpenses: profitMarginWithExp,
        monthlyExpensesData: expensesData
      });
    } catch (error) {
      console.error('Error calculating financial metrics with expenses:', error);
    }
  }, [stockEntries, basicFinancials.totalSalesValue]);

  // Calculate on mount and when dependencies change
  useEffect(() => {
    calculateExpensiveMetrics();
  }, [calculateExpensiveMetrics]);

  return {
    products,
    orders,
    monthlyData,
    lowStockProducts,
    ...basicFinancials,
    ...financialMetrics
  };
};