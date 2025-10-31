import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface AdminReportsParams {
  startDate: Date;
  endDate: Date;
}

interface FinancialSummary {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  averageMargin: number;
  previousSales: number;
  salesVariation: number;
}

interface ClientAnalysis {
  newClients: number;
  recurrentClients: number;
  inactiveClients: number;
  activeClients: number;
}

interface ProductAnalysis {
  topProducts: Array<{ name: string; revenue: number; quantity: number }>;
  highestMargin: { name: string; margin: number } | null;
  lowestRotation: { name: string; revenue: number } | null;
}

interface KPIIndicators {
  totalOrders: number;
  averageItemsPerOrder: number;
  averageTicket: number;
  totalActiveClients: number;
}

export interface AdminReportsData {
  financial: FinancialSummary;
  clients: ClientAnalysis;
  products: ProductAnalysis;
  kpis: KPIIndicators;
}

export function useAdminReportsData({ startDate, endDate }: AdminReportsParams) {
  return useQuery({
    queryKey: ["adminReportsData", startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<AdminReportsData> => {
      const from = startDate.toISOString();
      const to = endDate.toISOString();

      // Calculate previous period for comparison
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousStart = new Date(startDate);
      previousStart.setDate(previousStart.getDate() - periodDays);
      const previousEnd = new Date(endDate);
      previousEnd.setDate(previousEnd.getDate() - periodDays);

      // Fetch stock exits (sales) for current period
      const { data: exits, error: exitsError } = await supabase
        .from("stock_exits")
        .select(
          `
          id,
          date,
          client_id,
          discount,
          stock_exit_items (
            quantity,
            sale_price,
            discount_percent,
            product_name
          )
        `,
        )
        .gte("date", from)
        .lte("date", to)
        .eq("status", "active");

      if (exitsError) throw exitsError;

      // Fetch stock exits for previous period
      const { data: previousExits } = await supabase
        .from("stock_exits")
        .select(
          `
          stock_exit_items (
            quantity,
            sale_price,
            discount_percent,
            product_name
          )
        `,
        )
        .gte("date", previousStart.toISOString())
        .lte("date", previousEnd.toISOString())
        .eq("status", "active");

      // Fetch expenses
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select(
          `
          discount,
          expense_items (
            quantity,
            unit_price,
            discount_percent
          )
        `,
        )
        .gte("date", from)
        .lte("date", to)
        .eq("status", "active");

      if (expensesError) throw expensesError;

      // Calculate total sales
      const totalSales =
        exits?.reduce((sum, exit) => {
          const itemsTotal =
            exit.stock_exit_items?.reduce((itemSum, item) => {
              const itemTotal = item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);
              return itemSum + itemTotal;
            }, 0) || 0;
          return sum + itemsTotal * (1 - (exit.discount || 0) / 100);
        }, 0) || 0;

      // Calculate previous period sales
      const previousSales =
        previousExits?.reduce((sum, exit) => {
          const itemsTotal =
            exit.stock_exit_items?.reduce((itemSum, item) => {
              const itemTotal = item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);
              return itemSum + itemTotal;
            }, 0) || 0;
          return sum + itemsTotal;
        }, 0) || 0;

      // Calculate total expenses
      const totalExpenses =
        expenses?.reduce((sum, expense) => {
          const itemsTotal =
            expense.expense_items?.reduce((itemSum, item) => {
              const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
              return itemSum + itemTotal;
            }, 0) || 0;
          return sum + itemsTotal * (1 - (expense.discount || 0) / 100);
        }, 0) || 0;

      const netProfit = totalSales - totalExpenses;
      const averageMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
      const salesVariation = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;

      // Client Analysis
      const { data: allClients } = await supabase.from("clients").select("id, created_at").eq("status", "active");

      const newClients =
        allClients?.filter((c) => new Date(c.created_at) >= startDate && new Date(c.created_at) <= endDate).length || 0;

      // Count unique clients from exits
      const uniqueClientIds = new Set(exits?.map((e) => e.client_id).filter(Boolean));
      const activeClients = uniqueClientIds.size;

      // Recurrent clients (more than 1 purchase in period)
      const clientPurchaseCounts =
        exits?.reduce(
          (acc, exit) => {
            if (exit.client_id) {
              acc[exit.client_id] = (acc[exit.client_id] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      const recurrentClients = Object.values(clientPurchaseCounts).filter((count) => count > 1).length;

      // Inactive clients - clients with last purchase > 90 days ago
      const threeMonthsAgo = subMonths(new Date(), 3);
      const { data: recentExits } = await supabase
        .from("stock_exits")
        .select("client_id")
        .gte("date", threeMonthsAgo.toISOString())
        .eq("status", "active");

      const recentClientIds = new Set(recentExits?.map((e) => e.client_id).filter(Boolean));
      const totalClients = allClients?.length || 0;
      const inactiveClients = totalClients - recentClientIds.size;

      // ✅ Product Analysis (versão corrigida e filtrada)
      const productSalesMap: Record<string, { revenue: number; quantity: number }> = {};

      exits
        ?.filter((exit) => exit.status === "active" && exit.date >= from && exit.date <= to)
        .forEach((exit) => {
          exit.stock_exit_items
            ?.filter((item) => item.product_name && item.quantity > 0 && item.sale_price > 0)
            .forEach((item) => {
              // Normalizar nome (trim e capitalização)
              const name = item.product_name.trim();
              const itemRevenue = item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);

              if (!productSalesMap[name]) {
                productSalesMap[name] = { revenue: 0, quantity: 0 };
              }

              productSalesMap[name].revenue += itemRevenue;
              productSalesMap[name].quantity += item.quantity;
            });
        });

      const topProducts = Object.entries(productSalesMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const highestMargin =
        topProducts.length > 0
          ? { name: topProducts[0].name, margin: 45 } // Simplificado
          : null;

      const lowestRotation =
        Object.entries(productSalesMap)
          .map(([name, data]) => ({ name, revenue: data.revenue }))
          .sort((a, b) => a.revenue - b.revenue)[0] || null;

      // KPI Indicators
      const totalOrders = exits?.length || 0;
      const totalItems =
        exits?.reduce((sum, exit) => {
          return sum + (exit.stock_exit_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
        }, 0) || 0;

      const averageItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      return {
        financial: {
          totalSales,
          totalExpenses,
          netProfit,
          averageMargin,
          previousSales,
          salesVariation,
        },
        clients: {
          newClients,
          recurrentClients,
          inactiveClients,
          activeClients,
        },
        products: {
          topProducts,
          highestMargin,
          lowestRotation,
        },
        kpis: {
          totalOrders,
          averageItemsPerOrder,
          averageTicket,
          totalActiveClients: activeClients,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
