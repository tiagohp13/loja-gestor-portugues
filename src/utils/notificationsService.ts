import { supabase } from "@/integrations/supabase/client";
import { NotificationType, NotificationPriority } from "@/hooks/useNotifications";

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  expires_at?: string;
  related_id?: string; // ID of related entity (product, order, etc)
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
      related_id: params.related_id,
    },
  ]);

  if (error) {
    console.error("[Notifications] Error creating notification:", error);
    throw error;
  }
};

/**
 * Archive notifications for products that are no longer low stock
 */
export const archiveResolvedLowStockNotifications = async () => {
  // Get all active low stock notifications
  const { data: activeNotifications, error: notifError } = await supabase
    .from("notifications")
    .select("id, related_id")
    .eq("type", "stock")
    .eq("archived", false)
    .not("related_id", "is", null);

  if (notifError) {
    console.error("[Notifications] Error fetching active notifications:", notifError);
    return;
  }

  if (!activeNotifications || activeNotifications.length === 0) {
    return;
  }

  // Get product IDs from notifications
  const productIds = activeNotifications.map((n) => n.related_id);

  // Get current stock status for these products
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, current_stock, min_stock")
    .in("id", productIds);

  if (prodError) {
    console.error("[Notifications] Error checking products:", prodError);
    return;
  }

  // Find products where stock is now adequate
  const resolvedProductIds = (products || [])
    .filter((p) => p.current_stock >= p.min_stock)
    .map((p) => p.id);

  if (resolvedProductIds.length === 0) {
    return;
  }

  // Archive notifications for resolved products
  const { error: archiveError } = await supabase
    .from("notifications")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .in("related_id", resolvedProductIds)
    .eq("type", "stock")
    .eq("archived", false);

  if (archiveError) {
    console.error("[Notifications] Error archiving notifications:", archiveError);
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
    console.error("[Notifications] Error checking low stock:", error);
    return;
  }

  // Filter low stock products on client side
  const lowStockProducts = (products || []).filter(
    (p) => p.current_stock < p.min_stock
  );

  if (lowStockProducts.length === 0) {
    return;
  }

  // Get existing active stock notifications using related_id for accurate deduplication
  const { data: existingNotifications } = await supabase
    .from("notifications")
    .select("related_id")
    .eq("type", "stock")
    .eq("archived", false);

  // Create a set of existing product IDs for quick lookup
  const existingProductIds = new Set(
    (existingNotifications || [])
      .map((n) => n.related_id)
      .filter(Boolean)
  );

  // Create notifications only for products without active notifications
  for (const product of lowStockProducts) {
    // Skip if notification already exists for this product
    if (existingProductIds.has(product.id)) {
      continue;
    }

    try {
      await createNotification({
        title: "Stock Baixo",
        message: `${product.name} (${product.code}) está com stock baixo: ${product.current_stock} unidades (mínimo: ${product.min_stock})`,
        type: "stock",
        priority: "high",
        link: `/produtos/consultar/${product.id}`,
        related_id: product.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
    } catch (err) {
      console.error(`[Notifications] Failed to create notification for ${product.name}:`, err);
    }
  }
};

/**
 * Archive notifications for orders that are no longer overdue
 */
export const archiveResolvedOrderNotifications = async () => {
  // Get all active order notifications
  const { data: activeNotifications, error: notifError } = await supabase
    .from("notifications")
    .select("id, related_id")
    .eq("type", "order")
    .eq("archived", false)
    .not("related_id", "is", null);

  if (notifError) {
    console.error("[Notifications] Error fetching active order notifications:", notifError);
    return;
  }

  if (!activeNotifications || activeNotifications.length === 0) {
    return;
  }

  // Get order IDs from notifications
  const orderIds = activeNotifications.map((n) => n.related_id);

  // Get current status for these orders
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("id, converted_to_stock_exit_id, expected_delivery_date")
    .in("id", orderIds);

  if (orderError) {
    console.error("[Notifications] Error checking orders:", orderError);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find orders that are no longer overdue (completed or date passed)
  const resolvedOrderIds = (orders || [])
    .filter((o) => {
      // Order was converted to exit (completed)
      if (o.converted_to_stock_exit_id) return true;
      // Order delivery date is today or future
      const deliveryDate = new Date(o.expected_delivery_date);
      return deliveryDate >= today;
    })
    .map((o) => o.id);

  if (resolvedOrderIds.length === 0) {
    return;
  }

  // Archive notifications for resolved orders
  const { error: archiveError } = await supabase
    .from("notifications")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .in("related_id", resolvedOrderIds)
    .eq("type", "order")
    .eq("archived", false);

  if (archiveError) {
    console.error("[Notifications] Error archiving order notifications:", archiveError);
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
    console.error("[Notifications] Error checking overdue orders:", error);
    return;
  }

  if (!orders || orders.length === 0) {
    return;
  }

  // Get existing active order notifications using related_id
  const { data: existingNotifications } = await supabase
    .from("notifications")
    .select("related_id")
    .eq("type", "order")
    .eq("archived", false);

  // Create a set of existing order IDs for quick lookup
  const existingOrderIds = new Set(
    (existingNotifications || [])
      .map((n) => n.related_id)
      .filter(Boolean)
  );

  // Create notifications only for orders without active notifications
  for (const order of orders) {
    // Skip if notification already exists for this order
    if (existingOrderIds.has(order.id)) {
      continue;
    }

    try {
      await createNotification({
        title: "Encomenda Atrasada",
        message: `Encomenda ${order.number} de ${order.client_name} está atrasada`,
        type: "order",
        priority: "high",
        link: `/encomendas/consultar/${order.id}`,
        related_id: order.id,
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      });
    } catch (err) {
      console.error(`[Notifications] Failed to create notification for order ${order.number}:`, err);
    }
  }
};

/**
 * Run all automated notification checks
 * This includes creating new notifications and archiving resolved ones
 */
/**
 * Archive legacy notifications without related_id
 */
export const archiveLegacyNotifications = async () => {
  const { error } = await supabase
    .from("notifications")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .is("related_id", null)
    .eq("archived", false);

  if (error) {
    console.error("[Notifications] Error archiving legacy notifications:", error);
  }
};

export const runAutomatedNotificationChecks = async () => {
  try {
    // First, clean up legacy notifications
    await archiveLegacyNotifications();
    
    // Then, archive resolved notifications
    await Promise.all([
      archiveResolvedLowStockNotifications(),
      archiveResolvedOrderNotifications(),
    ]);

    // Finally, check for new issues
    await Promise.all([
      checkLowStockNotifications(),
      checkOverdueOrdersNotifications(),
    ]);
  } catch (error) {
    console.error("❌ [Notifications] Error running automated checks:", error);
  }
};
