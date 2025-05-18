
import { StockExit, StockEntry } from '@/types';

/**
 * Calculate total sales value from stock exits
 */
export const calculateTotalSalesValue = (stockExits: StockExit[]): number => {
  if (!stockExits || !Array.isArray(stockExits)) {
    return 0;
  }
  
  return stockExits.reduce((total, exit) => {
    if (!exit || !exit.items || !Array.isArray(exit.items)) {
      return total;
    }
    
    const exitTotal = exit.items.reduce((sum, item) => {
      if (!item || typeof item.quantity !== 'number' || typeof item.salePrice !== 'number') {
        return sum;
      }
      return sum + (item.quantity * item.salePrice);
    }, 0);
    
    return total + exitTotal;
  }, 0);
};

/**
 * Calculate total purchase value from stock entries
 */
export const calculateTotalPurchaseValue = (stockEntries: StockEntry[]): number => {
  if (!stockEntries || !Array.isArray(stockEntries)) {
    return 0;
  }
  
  return stockEntries.reduce((total, entry) => {
    if (!entry || !entry.items || !Array.isArray(entry.items)) {
      return total;
    }
    
    const entryTotal = entry.items.reduce((sum, item) => {
      if (!item || typeof item.quantity !== 'number' || typeof item.purchasePrice !== 'number') {
        return sum;
      }
      return sum + (item.quantity * item.purchasePrice);
    }, 0);
    
    return total + entryTotal;
  }, 0);
};

/**
 * Calculate profit (sales minus purchases)
 */
export const calculateTotalProfit = (totalSalesValue: number, totalPurchaseValue: number): number => {
  return (totalSalesValue || 0) - (totalPurchaseValue || 0);
};

/**
 * Calculate profit margin as percentage of sales
 */
export const calculateProfitMarginPercent = (totalProfit: number, totalSalesValue: number): number => {
  return (totalSalesValue || 0) > 0 ? ((totalProfit || 0) / totalSalesValue) * 100 : 0;
};

/**
 * Calculate ROI in monetary value (profit / purchases)
 */
export const calculateRoiValue = (totalProfit: number, totalPurchaseValue: number): number => {
  return (totalPurchaseValue || 0) > 0 ? (totalProfit || 0) / totalPurchaseValue : 0;
};

/**
 * Calculate ROI as percentage
 */
export const calculateRoiPercent = (totalProfit: number, totalPurchaseValue: number): number => {
  return (totalPurchaseValue || 0) > 0 ? ((totalProfit || 0) / totalPurchaseValue) * 100 : 0;
};

/**
 * Calculate average sale value per sale
 */
export const calculateAverageSaleValue = (totalSalesValue: number, salesCount: number): number => {
  return (salesCount || 0) > 0 ? (totalSalesValue || 0) / salesCount : 0;
};

/**
 * Calculate average profit per sale
 */
export const calculateAverageProfitPerSale = (totalProfit: number, salesCount: number): number => {
  return (salesCount || 0) > 0 ? (totalProfit || 0) / salesCount : 0;
};
