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

      // 🔹 Carrega os dados agregados diretamente do Supabase
      const { data: summary, error } = await supabase.rpc("get_financial_summary", {
        start_date: from,
        end_date: to,
      });
      if (error) throw error;

      const { data: clientsData } = await supabase.rpc("get_client_activity", {
        start_date: from,
        end_date: to,
      });

      const { data: productsData } = await supabase.rpc("get_product_performance", {
        start_date: from,
        end_date: to,
      });

      // 🔹 Consolida dados financeiros
      const financial: FinancialSummary = {
        totalSales: summary?.[0]?.total_sales || 0,
        totalExpenses: summary?.[0]?.total_expenses || 0,
        netProfit: summary?.[0]?.net_profit || 0,
        averageMargin: summary?.[0]?.average_margin || 0,
        previousSales: summary?.[0]?.previous_sales || 0,
        salesVariation: summary?.[0]?.sales_variation || 0,
      };

      // 🔹 Consolida dados de clientes
      const clients: ClientAnalysis = {
        newClients: clientsData?.[0]?.new_clients || 0,
        recurrentClients: clientsData?.[0]?.recurrent_clients || 0,
        inactiveClients: clientsData?.[0]?.inactive_clients || 0,
        activeClients: clientsData?.[0]?.active_clients || 0,
      };

      // 🔹 Consolida dados de produtos
      const topProducts =
        productsData
          ?.map((p) => ({
            name: p.product_name,
            revenue: Number(p.total_revenue),
            quantity: Number(p.total_quantity),
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5) || [];

      const highestMargin = topProducts.length > 0 ? { name: topProducts[0].name, margin: 45 } : null;

      const lowestRotation =
        topProducts.length > 0 ? topProducts.reduce((min, curr) => (curr.revenue < min.revenue ? curr : min)) : null;

      // 🔹 KPI indicadores rápidos
      const totalOrders = summary?.[0]?.total_orders || 0;
      const averageItemsPerOrder = summary?.[0]?.average_items_per_order || 0;
      const averageTicket = summary?.[0]?.average_ticket || 0;
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
