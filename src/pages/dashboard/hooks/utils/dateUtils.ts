
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
    const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
    dataMap.set(monthKey, {
      name: month.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
      vendas: 0,
      compras: 0
    });
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
    // Ensure exit has date and items property
    if (!exit.date || !exit.items) return;
    
    const date = ensureDate(exit.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (dataMap.has(monthKey)) {
      const current = dataMap.get(monthKey)!;
      // Check if items exist and are an array before reducing
      const exitTotal = Array.isArray(exit.items) 
        ? exit.items.reduce((sum, item) => {
            // Ensure item has required properties
            if (!item || typeof item.quantity !== 'number' || typeof item.salePrice !== 'number') {
              return sum;
            }
            return sum + (item.quantity * item.salePrice);
          }, 0)
        : 0;
      
      dataMap.set(monthKey, {
        ...current,
        vendas: current.vendas + exitTotal
      });
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
    // Ensure entry has date and items property
    if (!entry.date || !entry.items) return;
    
    const date = ensureDate(entry.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (dataMap.has(monthKey)) {
      const current = dataMap.get(monthKey)!;
      // Check if items exist and are an array before reducing
      const entryTotal = Array.isArray(entry.items) 
        ? entry.items.reduce((sum, item) => {
            // Ensure item has required properties
            if (!item || typeof item.quantity !== 'number' || typeof item.purchasePrice !== 'number') {
              return sum;
            }
            return sum + (item.quantity * item.purchasePrice);
          }, 0)
        : 0;
      
      dataMap.set(monthKey, {
        ...current,
        compras: current.compras + entryTotal
      });
    }
  });
};
