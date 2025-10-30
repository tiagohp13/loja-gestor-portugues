import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReportsDataParams {
  startDate?: string;
  endDate?: string;
}

interface MonthlySale {
  month: string;
  value: number;
}

interface ProductSale {
  name: string;
  quantity: number;
}

interface TopClient {
  client_id: string;
  client_name: string;
  total: number;
}

export function useReportsData({ startDate, endDate }: ReportsDataParams) {
  return useQuery({
    queryKey: ["reportsData", startDate, endDate],
    queryFn: async () => {
      const from = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const to = endDate || new Date().toISOString();

      // Buscar orders com items
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          date,
          client_id,
          client_name,
          discount,
          order_items (
            quantity,
            sale_price,
            discount_percent
          )
        `)
        .gte("date", from)
        .lte("date", to)
        .eq("status", "active");

      if (ordersError) throw ordersError;

      // Buscar stock exits com items
      const { data: exits, error: exitsError } = await supabase
        .from("stock_exits")
        .select(`
          id,
          date,
          client_id,
          client_name,
          discount,
          stock_exit_items (
            quantity,
            sale_price,
            discount_percent,
            product_name
          )
        `)
        .gte("date", from)
        .lte("date", to)
        .eq("status", "active");

      if (exitsError) throw exitsError;

      // Calcular vendas mensais
      const monthlySalesMap: Record<string, number> = {};

      exits?.forEach((exit) => {
        const month = new Date(exit.date).toLocaleString("pt-PT", { month: "short", year: "numeric" });
        const total = exit.stock_exit_items?.reduce((sum, item) => {
          const itemTotal = item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);
          return sum + itemTotal;
        }, 0) || 0;
        
        const totalWithDiscount = total * (1 - (exit.discount || 0) / 100);
        monthlySalesMap[month] = (monthlySalesMap[month] || 0) + totalWithDiscount;
      });

      const monthlySales: MonthlySale[] = Object.entries(monthlySalesMap)
        .map(([month, value]) => ({ month, value }))
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });

      // Top produtos vendidos
      const productSalesMap: Record<string, number> = {};

      exits?.forEach((exit) => {
        exit.stock_exit_items?.forEach((item) => {
          const name = item.product_name || "Sem nome";
          productSalesMap[name] = (productSalesMap[name] || 0) + item.quantity;
        });
      });

      const productSales: ProductSale[] = Object.entries(productSalesMap)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Top clientes
      const clientSalesMap: Record<string, { name: string; total: number }> = {};

      exits?.forEach((exit) => {
        const clientId = exit.client_id || "sem-cliente";
        const clientName = exit.client_name || "Cliente Desconhecido";
        
        const total = exit.stock_exit_items?.reduce((sum, item) => {
          const itemTotal = item.quantity * item.sale_price * (1 - (item.discount_percent || 0) / 100);
          return sum + itemTotal;
        }, 0) || 0;
        
        const totalWithDiscount = total * (1 - (exit.discount || 0) / 100);

        if (!clientSalesMap[clientId]) {
          clientSalesMap[clientId] = { name: clientName, total: 0 };
        }
        clientSalesMap[clientId].total += totalWithDiscount;
      });

      const topClients: TopClient[] = Object.entries(clientSalesMap)
        .map(([client_id, { name, total }]) => ({
          client_id,
          client_name: name,
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      return {
        monthlySales,
        productSales,
        topClients,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
