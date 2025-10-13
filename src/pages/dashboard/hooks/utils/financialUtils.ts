// ============================================
// 💰 financialUtils.ts
// ============================================
// Cálculos financeiros principais para o dashboard e KPIs.
// Inclui Vendas, Compras, Despesas, Lucro e Margens.
// Total Gasto = Compras + Despesas
// ============================================

import { StockExit, StockEntry } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// ============================================
// 🔹 Cálculos base
// ============================================

// Total de Vendas (baseado em saídas de stock)
export const calculateTotalSalesValue = (stockExits: StockExit[]): number => {
  return stockExits.reduce((total, exit) => {
    const exitTotal = exit.items.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
    return total + exitTotal;
  }, 0);
};

// Total de Compras (baseado em entradas de stock)
export const calculateTotalPurchaseValue = (stockEntries: StockEntry[]): number => {
  return stockEntries.reduce((total, entry) => {
    const entryTotal = entry.items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
    return total + entryTotal;
  }, 0);
};

// ============================================
// 🔹 Despesas do Supabase
// ============================================

// Total de Despesas (tabela "expenses")
export const calculateTotalExpensesValue = async (): Promise<number> => {
  try {
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select(
        `
        id,
        discount,
        created_at,
        expense_items(
          quantity,
          unit_price,
          discount_percent
        )
      `,
      )
      .is("deleted_at", null);

    if (error) {
      console.error("Erro ao buscar despesas:", error);
      return 0;
    }

    if (!expenses) return 0;

    return expenses.reduce((total, expense) => {
      const expenseItemsTotal = (expense.expense_items || []).reduce((sum: number, item: any) => {
        const itemTotal = item.quantity * item.unit_price;
        const discountAmount = itemTotal * ((item.discount_percent || 0) / 100);
        return sum + (itemTotal - discountAmount);
      }, 0);

      // Desconto total da despesa
      const finalTotal = expenseItemsTotal * (1 - (expense.discount || 0) / 100);
      return total + finalTotal;
    }, 0);
  } catch (error) {
    console.error("Erro ao calcular despesas totais:", error);
    return 0;
  }
};

// ============================================
// 🔹 Totais compostos
// ============================================

// Total Gasto = Compras + Despesas
export const calculateTotalSpent = async (stockEntries: StockEntry[]): Promise<number> => {
  const purchasesValue = calculateTotalPurchaseValue(stockEntries);
  const expensesValue = await calculateTotalExpensesValue();
  return purchasesValue + expensesValue;
};

// Lucro = Vendas − (Compras + Despesas)
export const calculateTotalProfitWithExpenses = async (
  totalSalesValue: number,
  stockEntries: StockEntry[],
): Promise<number> => {
  const totalSpent = await calculateTotalSpent(stockEntries);
  return totalSalesValue - totalSpent;
};

// Margem de Lucro (%) = Lucro / Vendas × 100
export const calculateProfitMarginPercentWithExpenses = async (
  totalSalesValue: number,
  stockEntries: StockEntry[],
): Promise<number> => {
  if (totalSalesValue === 0) return 0;
  const totalProfit = await calculateTotalProfitWithExpenses(totalSalesValue, stockEntries);
  return (totalProfit / totalSalesValue) * 100;
};

// ============================================
// 🔹 ROI (Retorno sobre o Investimento)
// ============================================

export const calculateRoiPercentWithExpenses = async (
  totalSalesValue: number,
  stockEntries: StockEntry[],
): Promise<number> => {
  const totalSpent = await calculateTotalSpent(stockEntries);
  if (totalSpent === 0) return 0;
  const totalProfit = await calculateTotalProfitWithExpenses(totalSalesValue, stockEntries);
  return (totalProfit / totalSpent) * 100;
};

// ============================================
// 🔹 Filtros e somatórios por intervalo
// ============================================

const inRange = (d: string, start: Date, end: Date) => {
  const x = new Date(d).getTime();
  return x >= start.getTime() && x <= end.getTime();
};

export const filterExitsByRange = (exits: StockExit[], start: Date, end: Date) =>
  exits.filter((e) => inRange(e.date, start, end));

export const filterEntriesByRange = (entries: StockEntry[], start: Date, end: Date) =>
  entries.filter((e) => inRange(e.date, start, end));

export const sumSalesInRange = (exits: StockExit[], start: Date, end: Date): number =>
  calculateTotalSalesValue(filterExitsByRange(exits, start, end));

export const sumPurchasesInRange = (entries: StockEntry[], start: Date, end: Date): number =>
  calculateTotalPurchaseValue(filterEntriesByRange(entries, start, end));

// Somatório de Despesas por intervalo (usado no useKpiDeltas)
export const sumExpensesInRange = async (start: Date, end: Date): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        discount,
        created_at,
        expense_items(
          quantity,
          unit_price,
          discount_percent
        )
      `,
      )
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .is("deleted_at", null);

    if (error || !data) {
      console.error("Erro ao buscar despesas por intervalo:", error);
      return 0;
    }

    return data.reduce((acc: number, expense: any) => {
      const itemsTotal = (expense.expense_items || []).reduce((sum: number, it: any) => {
        const base = (it.quantity || 0) * (it.unit_price || 0);
        const disc = base * ((it.discount_percent || 0) / 100);
        return sum + (base - disc);
      }, 0);
      const afterHeaderDisc = itemsTotal * (1 - (expense.discount || 0) / 100);
      return acc + afterHeaderDisc;
    }, 0);
  } catch (err) {
    console.error("Erro ao calcular despesas no intervalo:", err);
    return 0;
  }
};

// ============================================
// 🔹 Funções auxiliares genéricas
// ============================================

export const calcProfit = (sales: number, spent: number) => sales - spent;
export const calcMarginPct = (profit: number, sales: number) => (sales > 0 ? (profit / sales) * 100 : 0);

export const percentChange = (current: number, previous: number): number => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
