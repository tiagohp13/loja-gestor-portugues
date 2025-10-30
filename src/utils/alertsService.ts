import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "stock" | "order";
  message: string;
  description?: string;
  date: string;
}

/**
 * Guarda notificação no localStorage (máximo 20 notificações)
 */
function saveNotification(notification: Omit<Notification, "id" | "date">) {
  try {
    const existing = JSON.parse(localStorage.getItem("notifications") || "[]");
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...notification,
    };
    
    existing.unshift(newNotification);
    localStorage.setItem("notifications", JSON.stringify(existing.slice(0, 20)));
  } catch (err) {
    console.error("Erro ao guardar notificação:", err);
  }
}

/**
 * Verifica produtos com stock baixo e encomendas atrasadas
 * Exibe toasts automáticos para alertar o utilizador
 */
export async function checkAlerts() {
  try {
    // 🔹 1. Produtos com stock abaixo do mínimo
    const { data: lowStock, error: lowStockError } = await supabase
      .from("products")
      .select("id, name, current_stock, min_stock")
      .eq("status", "active")
      .or("current_stock.lte.min_stock,current_stock.lte.5")
      .order("current_stock", { ascending: true });

    if (lowStockError) throw lowStockError;

    if (lowStock && lowStock.length > 0) {
      const productNames = lowStock.slice(0, 3).map((p) => p.name).join(", ");
      const moreCount = lowStock.length > 3 ? ` e mais ${lowStock.length - 3}` : "";
      
      toast.warning(`⚠️ ${lowStock.length} produto${lowStock.length > 1 ? 's' : ''} com stock baixo`, {
        description: `${productNames}${moreCount}`,
        duration: 5000,
      });

      saveNotification({
        type: "stock",
        message: `${lowStock.length} produto${lowStock.length > 1 ? 's' : ''} com stock baixo`,
        description: `${productNames}${moreCount}`,
      });
    }

    // 🔹 2. Encomendas atrasadas (pendentes e com data de entrega no passado)
    const today = new Date().toISOString().split("T")[0];
    
    const { data: lateOrders, error: lateError } = await supabase
      .from("orders")
      .select("id, number, client_name, expected_delivery_date")
      .is("converted_to_stock_exit_id", null)
      .not("expected_delivery_date", "is", null)
      .lt("expected_delivery_date", today)
      .order("expected_delivery_date", { ascending: true });

    if (lateError) throw lateError;

    if (lateOrders && lateOrders.length > 0) {
      const orderDetails = lateOrders.slice(0, 2).map((o) => o.number || `#${o.id.slice(0, 8)}`).join(", ");
      const moreCount = lateOrders.length > 2 ? ` e mais ${lateOrders.length - 2}` : "";
      
      toast.warning(`🚚 ${lateOrders.length} encomenda${lateOrders.length > 1 ? 's' : ''} atrasada${lateOrders.length > 1 ? 's' : ''}`, {
        description: `${orderDetails}${moreCount}`,
        duration: 5000,
        action: {
          label: "Ver",
          onClick: () => window.location.href = "/encomendas/consultar",
        },
      });

      saveNotification({
        type: "order",
        message: `${lateOrders.length} encomenda${lateOrders.length > 1 ? 's' : ''} atrasada${lateOrders.length > 1 ? 's' : ''}`,
        description: `${orderDetails}${moreCount}`,
      });
    }
  } catch (err: any) {
    console.error("Erro ao verificar alertas:", err);
  }
}

/**
 * Obtém notificações guardadas no localStorage
 */
export function getNotifications(): Notification[] {
  try {
    return JSON.parse(localStorage.getItem("notifications") || "[]");
  } catch {
    return [];
  }
}

/**
 * Limpa todas as notificações
 */
export function clearNotifications() {
  localStorage.setItem("notifications", "[]");
}
