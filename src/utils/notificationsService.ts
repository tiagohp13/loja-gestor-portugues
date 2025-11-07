import { supabase } from "@/integrations/supabase/client";
import { NotificationType, NotificationPriority } from "@/hooks/useNotifications";

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  expires_at?: string;
}

/**
 * Create a new notification in the database
 * This will trigger realtime updates for all connected clients
 */
export const createNotification = async (params: CreateNotificationParams) => {
  const { error } = await supabase.from("notifications").insert([
    {
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority || "medium",
      link: params.link,
      expires_at: params.expires_at,
    },
  ]);

  if (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Check for low stock products and create notifications
 */
export const checkLowStockNotifications = async () => {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, code, current_stock, min_stock")
    .is("deleted_at", null);

  if (error) {
    console.error("Error checking low stock:", error);
    return;
  }

  // Filter low stock products on client side
  const lowStockProducts = (products || []).filter(
    (p) => p.current_stock < p.min_stock
  );

  // Create notifications for low stock products
  for (const product of lowStockProducts) {
    await createNotification({
      title: "Stock Baixo",
      message: `${product.name} (${product.code}) está com stock baixo: ${product.current_stock} unidades (mínimo: ${product.min_stock})`,
      type: "stock",
      priority: "high",
      link: `/produtos/consultar/${product.id}`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });
  }
};

/**
 * Check for overdue orders and create notifications
 */
export const checkOverdueOrdersNotifications = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, number, client_name, expected_delivery_date")
    .is("deleted_at", null)
    .is("converted_to_stock_exit_id", null)
    .lt("expected_delivery_date", today.toISOString());

  if (error) {
    console.error("Error checking overdue orders:", error);
    return;
  }

  // Create notifications for overdue orders
  for (const order of orders || []) {
    await createNotification({
      title: "Encomenda Atrasada",
      message: `Encomenda ${order.number} de ${order.client_name} está atrasada`,
      type: "order",
      priority: "high",
      link: `/encomendas/consultar/${order.id}`,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    });
  }
};

/**
 * Run all automated notification checks
 * This should be called periodically (e.g., every hour)
 */
export const runAutomatedNotificationChecks = async () => {
  console.log("Running automated notification checks...");
  
  try {
    await Promise.all([
      checkLowStockNotifications(),
      checkOverdueOrdersNotifications(),
    ]);
    console.log("Automated notification checks completed");
  } catch (error) {
    console.error("Error running automated checks:", error);
  }
};
