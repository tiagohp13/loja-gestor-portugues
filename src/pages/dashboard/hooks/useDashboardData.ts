import { useData } from '@/contexts/DataContext';
import { useMemo, useState, useEffect } from 'react';
import { 
  ensureDate, 
  createMonthlyDataMap, 
  processExitsForMonthlyData,
  processEntriesForMonthlyData 
} from './utils/dateUtils';
import { 
  createCategoryData, 
  identifyLowStockProducts, 
  calculateProductSales,
  findMostSoldProduct,
  calculateTotalStockValue
} from './utils/productUtils';
import { 
  findMostFrequentClient,
  findMostUsedSupplier 
} from './utils/clientSupplierUtils';
import { 
  calculateTotalSalesValue,
  calculateTotalPurchaseValue,
  calculateTotalProfit,
  calculateProfitMarginPercent,
  calculateRoiValue,
  calculateRoiPercent,
  calculateTotalSpent,
  calculateTotalProfitWithExpenses,
  calculateProfitMarginPercentWithExpenses,
  calculateRoiValueWithExpenses,
  calculateRoiPercentWithExpenses,
  getMonthlyExpensesData
} from './utils/financialUtils';
import { 
  createAllTransactions,
  getRecentTransactions
} from './utils/transactionUtils';

export const useDashboardData = () => {
  const { products, suppliers, clients, stockEntries, stockExits, orders } = useData();
  
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
  
  // Prepare category data for charts
  const categoryData = useMemo(() => {
    return createCategoryData(products);
  }, [products]);
  
  // Calculate low stock products
  const lowStockProducts = useMemo(() => {
    return identifyLowStockProducts(products);
  }, [products]);
  
  // Prepare transactions data
  const allTransactions = useMemo(() => {
    return createAllTransactions(stockEntries, stockExits, products, suppliers, clients);
  }, [stockEntries, stockExits, products, suppliers, clients]);
  
  const recentTransactions = useMemo(() => {
    return getRecentTransactions(allTransactions);
  }, [allTransactions]);
  
  // Calculate product sales
  const productSales = useMemo(() => {
    return calculateProductSales(stockExits);
  }, [stockExits]);
  
  // Find most sold product
  const mostSoldProduct = useMemo(() => {
    return findMostSoldProduct(productSales, products);
  }, [productSales, products]);
  
  // Find most frequent client
  const mostFrequentClient = useMemo(() => {
    return findMostFrequentClient(stockExits, clients);
  }, [stockExits, clients]);
  
  // Find most used supplier
  const mostUsedSupplier = useMemo(() => {
    return findMostUsedSupplier(stockEntries, suppliers);
  }, [stockEntries, suppliers]);
  
  // Calculate financial metrics (original without expenses)
  const totalSalesValue = useMemo(() => {
    return calculateTotalSalesValue(stockExits);
  }, [stockExits]);
  
  const totalPurchaseValue = useMemo(() => {
    return calculateTotalPurchaseValue(stockEntries);
  }, [stockEntries]);
  
  const totalStockValue = useMemo(() => {
    return calculateTotalStockValue(products);
  }, [products]);

  const totalProfit = useMemo(() => {
    return calculateTotalProfit(totalSalesValue, totalPurchaseValue);
  }, [totalSalesValue, totalPurchaseValue]);
  
  const profitMarginPercent = useMemo(() => {
    return calculateProfitMarginPercent(totalProfit, totalSalesValue);
  }, [totalProfit, totalSalesValue]);
  
  const roiValue = useMemo(() => {
    return calculateRoiValue(totalProfit, totalPurchaseValue);
  }, [totalProfit, totalPurchaseValue]);
  
  const roiPercent = useMemo(() => {
    return calculateRoiPercent(totalProfit, totalPurchaseValue);
  }, [totalProfit, totalPurchaseValue]);

  // Calculate financial metrics including expenses
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
    
    calculateWithExpenses();
  }, [stockEntries, totalSalesValue]);

  return {
    products,
    suppliers,
    clients,
    ensureDate,
    monthlyData,
    categoryData,
    lowStockProducts,
    allTransactions,
    recentTransactions,
    mostSoldProduct,
    mostFrequentClient,
    mostUsedSupplier,
    totalSalesValue,
    totalPurchaseValue,
    totalStockValue,
    totalProfit,
    profitMarginPercent,
    roiValue,
    roiPercent,
    productSales,
    orders,
    // New values including expenses
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses,
    roiValueWithExpenses,
    roiPercentWithExpenses
  };
};
