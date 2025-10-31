import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  activeClients: number;
  recurrentClients: number;
  inactiveClients: number;
}

interface ProductAnalysis {
  topProducts: Array<{ product_name: string; total_revenue: number; total_quantity: number }>;
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
      const from = startDate.toISOString().slice(0, 10);
      const to = endDate.toISOString().slice(0, 10);

      // 🔹 1. Chamar função financeira
      const { data: financialData, error: financialError } = await supabase.rpc("get_financial_summary", {
        start_date: from,
        end_date: to,
      });
      if (financialError) throw financialError;

      const [financial] = financialData || [
        {
          total_sales: 0,
          total_expenses: 0,
          net_profit: 0,
          average_margin: 0,
          previous_sales: 0,
          sales_variation: 0,
        },
      ];

      // 🔹 2. Chamar função de clientes
      const { data: clientsData, error: clientsError } = await supabase.rpc("get_client_activity", {
        start_date: from,
        end_date: to,
      });
      if (clientsError) throw clientsError;

      const [clients] = clientsData || [
        {
          new_clients: 0,
          active_clients: 0,
          recurrent_clients: 0,
          inactive_clients: 0,
        },
      ];

      // 🔹 3. Chamar função de produtos
      const { data: productsData, error: productsError } = await supabase.rpc("get_product_performance", {
        start_date: from,
        end_date: to,
      });
      if (productsError) throw productsError;

      // Top produtos
      const topProducts =
        productsData?.map((p) => ({
          name: p.product_name,
          revenue: Number(p.total_revenue),
          quantity: Number(p.total_quantity),
        })) || [];

      const highestMargin =
        topProducts.length > 0
          ? { name: topProducts[0].name, margin: 45 } // placeholder, até existir custo
          : null;

      const lowestRotation =
        topProducts.length > 0
          ? [...topProducts]
              .sort((a, b) => a.revenue - b.revenue)
              .slice(0, 1)
              .map((p) => ({ name: p.name, revenue: p.revenue }))[0]
          : null;

      // 🔹 4. KPIs derivados (usando dados agregados)
      const totalOrders = clients.active_clients; // proxy rápido
      const averageItemsPerOrder =
        topProducts.reduce((acc, p) => acc + p.quantity, 0) / (totalOrders > 0 ? totalOrders : 1);
      const averageTicket = totalOrders > 0 ? financial.total_sales / totalOrders : 0;

      return {
        financial: {
          totalSales: Number(financial.total_sales),
          totalExpenses: Number(financial.total_expenses),
          netProfit: Number(financial.net_profit),
          averageMargin: Number(financial.average_margin),
          previousSales: Number(financial.previous_sales),
          salesVariation: Number(financial.sales_variation),
        },
        clients: {
          newClients: clients.new_clients,
          activeClients: clients.active_clients,
          recurrentClients: clients.recurrent_clients,
          inactiveClients: clients.inactive_clients,
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
          totalActiveClients: clients.active_clients,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
