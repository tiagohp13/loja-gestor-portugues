import { useMemo } from 'react';
import { StockEntry, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateTotalSalesValue, 
  calculateTotalPurchaseValue,
  calculateTotalExpensesValue 
} from './utils/financialUtils';

interface KpiDelta {
  pct30d: number;
  pctMoM: number;
  value30d: number;
  valueMoM: number;
}

interface KpiDeltas {
  sales: KpiDelta;
  spent: KpiDelta;
  profit: KpiDelta;
  margin: KpiDelta;
}

/**
 * Hook to calculate KPI variations (30 days and Month over Month)
 */
export const useKpiDeltas = (
  stockExits: StockExit[],
  stockEntries: StockEntry[]
): KpiDeltas => {
  return useMemo(() => {
    const now = new Date();
    
    // Define date ranges
    const last30DaysStart = new Date(now);
    last30DaysStart.setDate(now.getDate() - 30);
    
    const previous30DaysStart = new Date(now);
    previous30DaysStart.setDate(now.getDate() - 60);
    const previous30DaysEnd = new Date(now);
    previous30DaysEnd.setDate(now.getDate() - 30);
    
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Filter data by date ranges
    const exitsLast30Days = stockExits.filter(exit => {
      const exitDate = new Date(exit.date);
      return exitDate >= last30DaysStart && exitDate <= now;
    });
    
    const exitsPrevious30Days = stockExits.filter(exit => {
      const exitDate = new Date(exit.date);
      return exitDate >= previous30DaysStart && exitDate < previous30DaysEnd;
    });
    
    const exitsCurrentMonth = stockExits.filter(exit => {
      const exitDate = new Date(exit.date);
      return exitDate >= currentMonthStart && exitDate <= now;
    });
    
    const exitsPreviousMonth = stockExits.filter(exit => {
      const exitDate = new Date(exit.date);
      return exitDate >= previousMonthStart && exitDate <= previousMonthEnd;
    });
    
    const entriesLast30Days = stockEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= last30DaysStart && entryDate <= now;
    });
    
    const entriesPrevious30Days = stockEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= previous30DaysStart && entryDate < previous30DaysEnd;
    });
    
    const entriesCurrentMonth = stockEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= currentMonthStart && entryDate <= now;
    });
    
    const entriesPreviousMonth = stockEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= previousMonthStart && entryDate <= previousMonthEnd;
    });
    
    // Calculate sales values
    const salesLast30Days = calculateTotalSalesValue(exitsLast30Days);
    const salesPrevious30Days = calculateTotalSalesValue(exitsPrevious30Days);
    const salesCurrentMonth = calculateTotalSalesValue(exitsCurrentMonth);
    const salesPreviousMonth = calculateTotalSalesValue(exitsPreviousMonth);
    
    // Calculate purchase values
    const purchasesLast30Days = calculateTotalPurchaseValue(entriesLast30Days);
    const purchasesPrevious30Days = calculateTotalPurchaseValue(entriesPrevious30Days);
    const purchasesCurrentMonth = calculateTotalPurchaseValue(entriesCurrentMonth);
    const purchasesPreviousMonth = calculateTotalPurchaseValue(entriesPreviousMonth);
    
    // Note: For expenses, we'll need to fetch them from Supabase
    // Since this is async, we'll return 0 for now and handle it separately
    // In a real scenario, you'd want to use useEffect to fetch this data
    const expensesLast30Days = 0;
    const expensesPrevious30Days = 0;
    const expensesCurrentMonth = 0;
    const expensesPreviousMonth = 0;
    
    // Calculate total spent (purchases + expenses)
    const spentLast30Days = purchasesLast30Days + expensesLast30Days;
    const spentPrevious30Days = purchasesPrevious30Days + expensesPrevious30Days;
    const spentCurrentMonth = purchasesCurrentMonth + expensesCurrentMonth;
    const spentPreviousMonth = purchasesPreviousMonth + expensesPreviousMonth;
    
    // Calculate profit
    const profitLast30Days = salesLast30Days - spentLast30Days;
    const profitPrevious30Days = salesPrevious30Days - spentPrevious30Days;
    const profitCurrentMonth = salesCurrentMonth - spentCurrentMonth;
    const profitPreviousMonth = salesPreviousMonth - spentPreviousMonth;
    
    // Calculate margin
    const marginLast30Days = salesLast30Days > 0 ? (profitLast30Days / salesLast30Days) * 100 : 0;
    const marginPrevious30Days = salesPrevious30Days > 0 ? (profitPrevious30Days / salesPrevious30Days) * 100 : 0;
    const marginCurrentMonth = salesCurrentMonth > 0 ? (profitCurrentMonth / salesCurrentMonth) * 100 : 0;
    const marginPreviousMonth = salesPreviousMonth > 0 ? (profitPreviousMonth / salesPreviousMonth) * 100 : 0;
    
    // Helper to calculate percentage change
    const calculatePctChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    return {
      sales: {
        pct30d: calculatePctChange(salesLast30Days, salesPrevious30Days),
        pctMoM: calculatePctChange(salesCurrentMonth, salesPreviousMonth),
        value30d: salesLast30Days,
        valueMoM: salesCurrentMonth
      },
      spent: {
        pct30d: calculatePctChange(spentLast30Days, spentPrevious30Days),
        pctMoM: calculatePctChange(spentCurrentMonth, spentPreviousMonth),
        value30d: spentLast30Days,
        valueMoM: spentCurrentMonth
      },
      profit: {
        pct30d: calculatePctChange(profitLast30Days, profitPrevious30Days),
        pctMoM: calculatePctChange(profitCurrentMonth, profitPreviousMonth),
        value30d: profitLast30Days,
        valueMoM: profitCurrentMonth
      },
      margin: {
        pct30d: calculatePctChange(marginLast30Days, marginPrevious30Days),
        pctMoM: calculatePctChange(marginCurrentMonth, marginPreviousMonth),
        value30d: marginLast30Days,
        valueMoM: marginCurrentMonth
      }
    };
  }, [stockExits, stockEntries]);
};
