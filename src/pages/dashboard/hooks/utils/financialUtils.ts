
import { StockExit, StockEntry } from '@/types';

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
 * Calculate profit (sales minus purchases)
 */
export const calculateTotalProfit = (totalSalesValue: number, totalPurchaseValue: number): number => {
  return totalSalesValue - totalPurchaseValue;
};

/**
 * Calculate profit margin as percentage of sales
 */
export const calculateProfitMarginPercent = (totalProfit: number, totalSalesValue: number): number => {
  return totalSalesValue > 0 ? (totalProfit / totalSalesValue) * 100 : 0;
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
 * Calculate average profit per sale
 */
export const calculateAverageProfitPerSale = (totalProfit: number, salesCount: number): number => {
  return salesCount > 0 ? totalProfit / salesCount : 0;
};
