
import { StockEntry, StockExit } from '@/types';

/**
 * Ensures a value is converted to a proper Date object
 */
export const ensureDate = (dateInput: string | Date): Date => {
  return dateInput instanceof Date ? dateInput : new Date(dateInput);
};

/**
 * Creates a mapping of monthly data entries for the last 6 months
 */
export const createMonthlyDataMap = (): Map<string, { name: string, vendas: number, compras: number }> => {
  const dataMap = new Map();
  
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = month.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
    
    // Use monthName as key to avoid duplicates
    if (!dataMap.has(monthName)) {
      dataMap.set(monthName, {
        name: monthName,
        vendas: 0,
        compras: 0
      });
    }
  }
  
  return dataMap;
};

/**
 * Processes stock exits to populate monthly sales data
 */
export const processExitsForMonthlyData = (
  stockExits: StockExit[], 
  dataMap: Map<string, { name: string, vendas: number, compras: number }>
): void => {
  stockExits.forEach(exit => {
    const date = ensureDate(exit.date);
    const monthName = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
    
    if (dataMap.has(monthName)) {
      const current = dataMap.get(monthName)!;
      const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      
      current.vendas += exitTotal;
    }
  });
};

/**
 * Processes stock entries to populate monthly purchase data
 */
export const processEntriesForMonthlyData = (
  stockEntries: StockEntry[],
  dataMap: Map<string, { name: string, vendas: number, compras: number }>
): void => {
  stockEntries.forEach(entry => {
    const date = ensureDate(entry.date);
    const monthName = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
    
    if (dataMap.has(monthName)) {
      const current = dataMap.get(monthName)!;
      const entryTotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
      
      current.compras += entryTotal;
    }
  });
};
