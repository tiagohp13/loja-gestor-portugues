import { useMemo, useState, useEffect, useCallback } from 'react';
import { useProducts } from '@/contexts/ProductsContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useStock } from '@/contexts/StockContext';
import { 
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
  calculateRoiValueWithExpenses,
  calculateRoiPercentWithExpenses,
  getMonthlyExpensesData
} from './utils/financialUtils';

interface FinancialMetrics {
  totalSpentWithExpenses: number;
  totalProfitWithExpenses: number;
  profitMarginPercentWithExpenses: number;
  roiValueWithExpenses: number;
  roiPercentWithExpenses: number;
  monthlyExpensesData: Record<string, number>;
}

export const useDashboardData = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  const { stockEntries, stockExits } = useStock();
  
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({
    totalSpentWithExpenses: 0,
    totalProfitWithExpenses: 0,
    profitMarginPercentWithExpenses: 0,
    roiValueWithExpenses: 0,
    roiPercentWithExpenses: 0,
    monthlyExpensesData: {}
  });

  // Monthly data for charts (includes expenses)
  const monthlyData = useMemo(() => {
    const dataMap = createMonthlyDataMap();
    processExitsForMonthlyData(stockExits, dataMap);
    processEntriesForMonthlyData(stockEntries, dataMap);
    
    Object.entries(financialMetrics.monthlyExpensesData).forEach(([monthKey, expenseValue]) => {
      const [year, month] = monthKey.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleDateString('pt-PT', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (dataMap.has(monthName)) {
        dataMap.get(monthName)!.compras += expenseValue;
      }
    });
    
    return Array.from(dataMap.values());
  }, [stockExits, stockEntries, financialMetrics.monthlyExpensesData]);
  
  const lowStockProducts = useMemo(() => identifyLowStockProducts(products), [products]);
  
  const basicFinancials = useMemo(() => ({
    totalSalesValue: calculateTotalSalesValue(stockExits),
    totalPurchaseValue: calculateTotalPurchaseValue(stockEntries),
    totalStockValue: calculateTotalStockValue(products)
  }), [stockExits, stockEntries, products]);

  const calculateFinancialMetrics = useCallback(async () => {
    try {
      const [totalSpent, totalProfit, profitMargin, roiVal, roiPerc, expenses] = await Promise.all([
        calculateTotalSpent(stockEntries),
        calculateTotalProfitWithExpenses(basicFinancials.totalSalesValue, stockEntries),
        calculateProfitMarginPercentWithExpenses(basicFinancials.totalSalesValue, stockEntries),
        calculateRoiValueWithExpenses(basicFinancials.totalSalesValue, stockEntries),
        calculateRoiPercentWithExpenses(basicFinancials.totalSalesValue, stockEntries),
        getMonthlyExpensesData()
      ]);
      
      setFinancialMetrics({
        totalSpentWithExpenses: totalSpent,
        totalProfitWithExpenses: totalProfit,
        profitMarginPercentWithExpenses: profitMargin,
        roiValueWithExpenses: roiVal,
        roiPercentWithExpenses: roiPerc,
        monthlyExpensesData: expenses
      });
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
    }
  }, [stockEntries, basicFinancials.totalSalesValue]);

  useEffect(() => {
    const timer = setTimeout(calculateFinancialMetrics, 300);
    return () => clearTimeout(timer);
  }, [calculateFinancialMetrics]);

  return {
    products,
    orders,
    monthlyData,
    lowStockProducts,
    ...basicFinancials,
    ...financialMetrics
  };
};
