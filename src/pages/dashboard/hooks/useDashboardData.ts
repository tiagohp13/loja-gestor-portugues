
import { useData } from '@/contexts/DataContext';
import { useMemo } from 'react';
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
  calculateRoiPercent
} from './utils/financialUtils';
import { 
  createAllTransactions,
  getRecentTransactions
} from './utils/transactionUtils';

export const useDashboardData = () => {
  const { products = [], suppliers = [], clients = [], stockEntries = [], stockExits = [], orders = [] } = useData();

  // Prepare monthly data for charts
  const monthlyData = useMemo(() => {
    const dataMap = createMonthlyDataMap();
    if (stockExits && Array.isArray(stockExits)) {
      processExitsForMonthlyData(stockExits, dataMap);
    }
    if (stockEntries && Array.isArray(stockEntries)) {
      processEntriesForMonthlyData(stockEntries, dataMap);
    }
    return Array.from(dataMap.values());
  }, [stockExits, stockEntries]);
  
  // Prepare category data for charts
  const categoryData = useMemo(() => {
    return createCategoryData(products || []);
  }, [products]);
  
  // Calculate low stock products
  const lowStockProducts = useMemo(() => {
    return identifyLowStockProducts(products || []);
  }, [products]);
  
  // Prepare transactions data
  const allTransactions = useMemo(() => {
    return createAllTransactions(stockEntries || [], stockExits || [], products || [], suppliers || [], clients || []);
  }, [stockEntries, stockExits, products, suppliers, clients]);
  
  const recentTransactions = useMemo(() => {
    return getRecentTransactions(allTransactions || []);
  }, [allTransactions]);
  
  // Calculate product sales
  const productSales = useMemo(() => {
    return calculateProductSales(stockExits || []);
  }, [stockExits]);
  
  // Find most sold product
  const mostSoldProduct = useMemo(() => {
    return findMostSoldProduct(productSales, products || []);
  }, [productSales, products]);
  
  // Find most frequent client
  const mostFrequentClient = useMemo(() => {
    return findMostFrequentClient(stockExits || [], clients || []);
  }, [stockExits, clients]);
  
  // Find most used supplier
  const mostUsedSupplier = useMemo(() => {
    return findMostUsedSupplier(stockEntries || [], suppliers || []);
  }, [stockEntries, suppliers]);
  
  // Calculate financial metrics
  const totalSalesValue = useMemo(() => {
    return calculateTotalSalesValue(stockExits || []);
  }, [stockExits]);
  
  const totalPurchaseValue = useMemo(() => {
    return calculateTotalPurchaseValue(stockEntries || []);
  }, [stockEntries]);
  
  const totalStockValue = useMemo(() => {
    return calculateTotalStockValue(products || []);
  }, [products]);

  const totalProfit = useMemo(() => {
    return calculateTotalProfit(totalSalesValue || 0, totalPurchaseValue || 0);
  }, [totalSalesValue, totalPurchaseValue]);
  
  const profitMarginPercent = useMemo(() => {
    return calculateProfitMarginPercent(totalProfit || 0, totalSalesValue || 0);
  }, [totalProfit, totalSalesValue]);
  
  const roiValue = useMemo(() => {
    return calculateRoiValue(totalProfit || 0, totalPurchaseValue || 0);
  }, [totalProfit, totalPurchaseValue]);
  
  const roiPercent = useMemo(() => {
    return calculateRoiPercent(totalProfit || 0, totalPurchaseValue || 0);
  }, [totalProfit, totalPurchaseValue]);

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
    orders
  };
};
