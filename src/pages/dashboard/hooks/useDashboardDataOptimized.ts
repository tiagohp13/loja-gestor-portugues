import { useData } from "@/contexts/DataContext";
import { useMemo, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureDate,
  createMonthlyDataMap,
  processExitsForMonthlyData,
  processEntriesForMonthlyData,
} from "./utils/dateUtils";
import { identifyLowStockProducts, calculateTotalStockValue } from "./utils/productUtils";
import {
  calculateTotalSalesValue,
  calculateTotalPurchaseValue,
  calculateTotalSpent,
  calculateTotalProfitWithExpenses,
  calculateProfitMarginPercentWithExpenses,
  getMonthlyExpensesData,
} from "./utils/financialUtils";

export const useDashboardDataRealtime = () => {
  const { products, stockEntries, stockExits, orders } = useData();

  const [financialMetrics, setFinancialMetrics] = useState({
    totalSpentWithExpenses: 0,
    totalProfitWithExpenses: 0,
    profitMarginPercentWithExpenses: 0,
    monthlyExpensesData: {} as Record<string, number>,
    last30Days: {
      totalSales: 0,
      totalPurchases: 0,
      profit: 0,
      profitMargin: 0,
    },
    monthComparison: {
      currentMonth: 0,
      previousMonth: 0,
      variationPercent: 0,
    },
  });

  const [version, setVersion] = useState(0);

  // Supabase realtime updates
  useEffect(() => {
    const tables = ["stock_entries", "stock_exits", "expenses"];
    const channels = tables.map((table) =>
      supabase
        .channel(`realtime-${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => {
          setVersion((v) => v + 1);
        })
        .subscribe(),
    );
    return () => channels.forEach((c) => supabase.removeChannel(c));
  }, []);

  // Memoized basic financials
  const basicFinancials = useMemo(
    () => ({
      totalSalesValue: calculateTotalSalesValue(stockExits),
      totalPurchaseValue: calculateTotalPurchaseValue(stockEntries),
      totalStockValue: calculateTotalStockValue(products),
    }),
    [stockExits, stockEntries, products],
  );

  // Low stock products
  const lowStockProducts = useMemo(() => identifyLowStockProducts(products), [products]);

  // Recalculate metrics whenever stock/entries/expenses change
  const calculateMetrics = useCallback(async () => {
    const now = new Date();
    const start30Days = new Date();
    start30Days.setDate(now.getDate() - 30);

    // Filter entries and exits para últimos 30 dias
    const recentEntries = stockEntries.filter((e) => new Date(e.date) >= start30Days);
    const recentExits = stockExits.filter((e) => new Date(e.date) >= start30Days);

    // Total últimos 30 dias
    const totalSales30 = calculateTotalSalesValue(recentExits);
    const totalPurchases30 = calculateTotalPurchaseValue(recentEntries);
    const profit30 = totalSales30 - totalPurchases30; // incluir despesas se quiser
    const margin30 = totalSales30 ? (profit30 / totalSales30) * 100 : 0;

    // Mês atual e mês anterior
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonthDate = new Date(currentYear, currentMonth - 1);
    const prevMonth = previousMonthDate.getMonth();
    const prevYear = previousMonthDate.getFullYear();

    const totalSalesCurrentMonth = calculateTotalSalesValue(
      stockExits.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    );

    const totalSalesPrevMonth = calculateTotalSalesValue(
      stockExits.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }),
    );

    const variationPercent = totalSalesPrevMonth
      ? ((totalSalesCurrentMonth - totalSalesPrevMonth) / totalSalesPrevMonth) * 100
      : 100;

    // Expenses
    const expensesData = await getMonthlyExpensesData();
    const totalSpentWithExpenses = await calculateTotalSpent(stockEntries);
    const totalProfitWithExpenses = await calculateTotalProfitWithExpenses(
      basicFinancials.totalSalesValue,
      stockEntries,
    );
    const profitMarginPercentWithExpenses = await calculateProfitMarginPercentWithExpenses(
      basicFinancials.totalSalesValue,
      stockEntries,
    );

    setFinancialMetrics({
      totalSpentWithExpenses,
      totalProfitWithExpenses,
      profitMarginPercentWithExpenses,
      monthlyExpensesData: expensesData,
      last30Days: {
        totalSales: totalSales30,
        totalPurchases: totalPurchases30,
        profit: profit30,
        profitMargin: margin30,
      },
      monthComparison: {
        currentMonth: totalSalesCurrentMonth,
        previousMonth: totalSalesPrevMonth,
        variationPercent,
      },
    });
  }, [stockEntries, stockExits, basicFinancials]);

  useEffect(() => {
    const timer = setTimeout(calculateMetrics, 0); // run immediately
    return () => clearTimeout(timer);
  }, [calculateMetrics, version]);

  return {
    products,
    orders,
    lowStockProducts,
    ...basicFinancials,
    ...financialMetrics,
  };
};
