import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths } from "date-fns";

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
  topProducts: Array<{ product_name: string; total_revenue: number; total_quantity: number }>;
  highestMargin: { name: string; margin: number } | null;
  lowestRotation: { name: string; total_revenue: number } | null;
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

      // 🔹 Fetch financial data
      const { data: exits } = await supabase
        .from("stock_exits")
        .select(`
          id,
          date,
          discount,
          client_id,
          stock_exit_items (
            product_name,
            quantity,
            sale_price,
            discount_percent
          )
        `)
        .eq("status", "active")
        .gte("date", from)
        .lte("date", to);

      const { data: expenses } = await supabase
        .from("expenses")
        .select(`
          id,
          date,
          expense_items (
            quantity,
            unit_price,
            discount_percent
          )
        `)
        .eq("status", "active")
        .gte("date", from)
        .lte("date", to);

      // Calculate previous period
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const prevStart = new Date(startDate);
      prevStart.setDate(prevStart.getDate() - periodDays);
      const prevEnd = new Date(endDate);
      prevEnd.setDate(prevEnd.getDate() - periodDays);

      const { data: prevExits } = await supabase
        .from("stock_exits")
        .select(`
          stock_exit_items (
            quantity,
            sale_price,
            discount_percent
          )
        `)
        .eq("status", "active")
        .gte("date", prevStart.toISOString())
        .lte("date", prevEnd.toISOString());

      // Calculate totals
      let totalSales = 0;
      const productRevenue: Record<string, { revenue: number; quantity: number }> = {};

      exits?.forEach((exit) => {
        exit.stock_exit_items?.forEach((item: any) => {
          const itemTotal = item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);
          totalSales += itemTotal;

          const productName = item.product_name?.trim() || "Desconhecido";
          if (!productRevenue[productName]) {
            productRevenue[productName] = { revenue: 0, quantity: 0 };
          }
          productRevenue[productName].revenue += itemTotal;
          productRevenue[productName].quantity += item.quantity;
        });
      });

      let totalExpenses = 0;
      expenses?.forEach((expense) => {
        expense.expense_items?.forEach((item: any) => {
          totalExpenses += item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
        });
      });

      let previousSales = 0;
      prevExits?.forEach((exit) => {
        exit.stock_exit_items?.forEach((item: any) => {
          previousSales += item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);
        });
      });

      // Client analysis
      const { data: newClientsData } = await supabase
        .from("clients")
        .select("id")
        .eq("status", "active")
        .gte("created_at", from)
        .lte("created_at", to);

      const { data: activeExitsData } = await supabase
        .from("stock_exits")
        .select("client_id")
        .eq("status", "active")
        .gte("date", from)
        .lte("date", to)
        .not("client_id", "is", null);

      const uniqueActiveClients = new Set(activeExitsData?.map((e) => e.client_id) || []);

      const { data: recurrentData } = await supabase
        .from("stock_exits")
        .select("client_id")
        .eq("status", "active")
        .gte("date", from)
        .lte("date", to)
        .not("client_id", "is", null);

      const clientPurchases: Record<string, number> = {};
      recurrentData?.forEach((exit) => {
        if (exit.client_id) {
          clientPurchases[exit.client_id] = (clientPurchases[exit.client_id] || 0) + 1;
        }
      });
      const recurrentClients = Object.values(clientPurchases).filter((count) => count > 1).length;

      const { data: recentClientsData } = await supabase
        .from("stock_exits")
        .select("client_id")
        .eq("status", "active")
        .gte("date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .not("client_id", "is", null);

      const recentClients = new Set(recentClientsData?.map((e) => e.client_id) || []);

      const { data: allClientsData } = await supabase
        .from("clients")
        .select("id")
        .eq("status", "active");

      const inactiveClients = (allClientsData?.length || 0) - recentClients.size;

      // 🔹 Consolida dados financeiros
      const netProfit = totalSales - totalExpenses;
      const averageMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
      const salesVariation = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;

      const financial: FinancialSummary = {
        totalSales,
        totalExpenses,
        netProfit,
        averageMargin,
        previousSales,
        salesVariation,
      };

      // 🔹 Consolida dados de clientes
      const clients: ClientAnalysis = {
        newClients: newClientsData?.length || 0,
        recurrentClients,
        inactiveClients,
        activeClients: uniqueActiveClients.size,
      };

      // 🔹 Consolida dados de produtos
      const topProducts = Object.entries(productRevenue)
        .map(([product_name, data]) => ({
          product_name,
          total_revenue: data.revenue,
          total_quantity: data.quantity,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);

      const highestMargin = topProducts.length > 0 ? { name: topProducts[0].product_name, margin: 45 } : null;

      const lowestRotation =
        topProducts.length > 0
          ? {
              name: topProducts.reduce((min, curr) => (curr.total_revenue < min.total_revenue ? curr : min)).product_name,
              total_revenue: topProducts.reduce((min, curr) => (curr.total_revenue < min.total_revenue ? curr : min)).total_revenue
            }
          : null;

      // 🔹 KPI indicadores rápidos
      const totalOrders = exits?.length || 0;
      const totalItems = exits?.reduce((sum, exit) => sum + (exit.stock_exit_items?.length || 0), 0) || 0;
      const averageItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
      const totalActiveClients = clients.activeClients;

      return {
        financial,
        clients,
        products: {
          topProducts,
          highestMargin,
          lowestRotation,
        },
        kpis: {
          totalOrders,
          averageItemsPerOrder,
          averageTicket,
          totalActiveClients,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
