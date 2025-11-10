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
 * Only creates notification if one doesn't already exist for this product
 */
export const checkLowStockNotifications = async () => {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, code, current_stock, min_stock")
    .is("deleted_at", null)
    .eq("status", "active");

  if (error) {
    console.error("Error checking low stock:", error);
    return;
  }

  // Filter low stock products on client side
  const lowStockProducts = (products || []).filter(
    (p) => p.current_stock < p.min_stock
  );

  if (lowStockProducts.length === 0) {
    return;
  }

  // Get existing active stock notifications from last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existingNotifications } = await supabase
    .from("notifications")
    .select("link")
    .eq("type", "stock")
    .eq("archived", false)
    .gte("created_at", oneDayAgo);

  // Create a set of existing notification links for quick lookup
  const existingLinks = new Set(
    (existingNotifications || []).map((n) => n.link)
  );

  // Create notifications only for products without recent notifications
  for (const product of lowStockProducts) {
    const link = `/produtos/consultar/${product.id}`;
    
    // Skip if notification already exists
    if (existingLinks.has(link)) {
      continue;
    }

    await createNotification({
      title: "Stock Baixo",
      message: `${product.name} (${product.code}) está com stock baixo: ${product.current_stock} unidades (mínimo: ${product.min_stock})`,
      type: "stock",
      priority: "high",
      link,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });
  }
};

/**
 * Check for overdue orders and create notifications
 * Only creates notification if one doesn't already exist for this order
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

  if (!orders || orders.length === 0) {
    return;
  }

  // Get existing active order notifications from last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existingNotifications } = await supabase
    .from("notifications")
    .select("link")
    .eq("type", "order")
    .eq("archived", false)
    .gte("created_at", oneDayAgo);

  // Create a set of existing notification links for quick lookup
  const existingLinks = new Set(
    (existingNotifications || []).map((n) => n.link)
  );

  // Create notifications only for orders without recent notifications
  for (const order of orders) {
    const link = `/encomendas/consultar/${order.id}`;
    
    // Skip if notification already exists
    if (existingLinks.has(link)) {
      continue;
    }

    await createNotification({
      title: "Encomenda Atrasada",
      message: `Encomenda ${order.number} de ${order.client_name} está atrasada`,
      type: "order",
      priority: "high",
      link,
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
