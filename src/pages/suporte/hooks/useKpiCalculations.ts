import { useMemo } from 'react';
import { SupportStats } from '../types/supportTypes';

const calculateKpi = (value: number, decimals: number = 2): number => {
  return Number(value.toFixed(decimals));
};

const safeDivide = (numerator: number, denominator: number, decimals: number = 2): number => {
  return denominator > 0 ? calculateKpi(numerator / denominator, decimals) : 0;
};

export const useKpiCalculations = (stats: SupportStats) => {
  return useMemo(() => {
    const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
    const salesCount = stats.completedOrders;
    const totalTransactions = totalEntries + (stats.numberOfExpenses || 0);
    
    return {
      roi: safeDivide(stats.profit * 100, stats.totalSpent),
      profitMargin: calculateKpi(stats.profitMargin),
      salesConversionRate: safeDivide(salesCount * 100, stats.clientsCount),
      averagePurchaseValue: safeDivide(stats.totalSpent, totalTransactions),
      averageSaleValue: safeDivide(stats.totalSales, salesCount),
      totalProfit: calculateKpi(stats.profit),
      averageProfitPerSale: safeDivide(stats.profit, salesCount),
      profitPerClient: safeDivide(stats.profit, stats.clientsCount),
      salesCount,
      totalEntries,
      totalTransactions
    };
  }, [stats]);
};
