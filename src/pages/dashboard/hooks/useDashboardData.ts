import { useData } from '@/contexts/DataContext';
import { useMemo, useState, useEffect } from 'react';
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

export const useDashboardData = () => {
  const { products, stockEntries, stockExits, orders } = useData();
  
  // State for values that include expenses
  const [totalSpentWithExpenses, setTotalSpentWithExpenses] = useState(0);
  const [totalProfitWithExpenses, setTotalProfitWithExpenses] = useState(0);
  const [profitMarginPercentWithExpenses, setProfitMarginPercentWithExpenses] = useState(0);
  const [roiValueWithExpenses, setRoiValueWithExpenses] = useState(0);
  const [roiPercentWithExpenses, setRoiPercentWithExpenses] = useState(0);
  const [monthlyExpensesData, setMonthlyExpensesData] = useState<Record<string, number>>({});

  // Prepare monthly data for charts (now including expenses)
  const monthlyData = useMemo(() => {
    const dataMap = createMonthlyDataMap();
    processExitsForMonthlyData(stockExits, dataMap);
    processEntriesForMonthlyData(stockEntries, dataMap);
    
    // Add expenses data to monthly chart
    Object.entries(monthlyExpensesData).forEach(([monthKey, expenseValue]) => {
      const [year, month] = monthKey.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = monthDate.toLocaleDateString('pt-PT', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (dataMap.has(monthName)) {
        const existing = dataMap.get(monthName)!;
        existing.compras += expenseValue; // Add expenses to purchases
      }
    });
    
    return Array.from(dataMap.values());
  }, [stockExits, stockEntries, monthlyExpensesData]);
  
  // Calculate low stock products (only needed for dashboard)
  const lowStockProducts = useMemo(() => {
    return identifyLowStockProducts(products);
  }, [products]);
  
  // Calculate basic financial metrics (optimized)
  const { totalSalesValue, totalPurchaseValue, totalStockValue } = useMemo(() => ({
    totalSalesValue: calculateTotalSalesValue(stockExits),
    totalPurchaseValue: calculateTotalPurchaseValue(stockEntries),
    totalStockValue: calculateTotalStockValue(products)
  }), [stockExits, stockEntries, products]);

  // Calculate financial metrics including expenses - debounced for performance
  useEffect(() => {
    const calculateWithExpenses = async () => {
      try {
        const [totalSpent, totalProfitWithExp, profitMarginWithExp, roiValWithExp, roiPercWithExp, expensesData] = await Promise.all([
          calculateTotalSpent(stockEntries),
          calculateTotalProfitWithExpenses(totalSalesValue, stockEntries),
          calculateProfitMarginPercentWithExpenses(totalSalesValue, stockEntries),
          calculateRoiValueWithExpenses(totalSalesValue, stockEntries),
          calculateRoiPercentWithExpenses(totalSalesValue, stockEntries),
          getMonthlyExpensesData()
        ]);
        
        setTotalSpentWithExpenses(totalSpent);
        setTotalProfitWithExpenses(totalProfitWithExp);
        setProfitMarginPercentWithExpenses(profitMarginWithExp);
        setRoiValueWithExpenses(roiValWithExp);
        setRoiPercentWithExpenses(roiPercWithExp);
        setMonthlyExpensesData(expensesData);
      } catch (error) {
        console.error('Error calculating financial metrics with expenses:', error);
      }
    };
    
    // Debounce expensive calculations
    const timer = setTimeout(calculateWithExpenses, 300);
    return () => clearTimeout(timer);
  }, [stockEntries, totalSalesValue]);

  return {
    products,
    orders,
    monthlyData,
    lowStockProducts,
    totalSalesValue,
    totalPurchaseValue,
    totalStockValue,
    // Values including expenses
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses,
    roiValueWithExpenses,
    roiPercentWithExpenses
  };
};
