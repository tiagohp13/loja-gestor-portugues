import { runAutomatedNotificationChecks } from "./notificationsService";

// Legacy support - kept for backwards compatibility
export interface Notification {
  id: string;
  type: "stock" | "order";
  message: string;
  description?: string;
  date: string;
}

/**
 * Legacy function - migrated to database notifications
 * @deprecated Use notificationsService instead
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
 * Check alerts - now uses database notifications
 */
export async function checkAlerts() {
  try {
    console.log('Running automated notification checks (database-based)...');
    await runAutomatedNotificationChecks();
  } catch (err: any) {
    console.error("Erro ao verificar alertas:", err);
  }
}

/**
 * Get notifications from localStorage (legacy)
 * @deprecated Use useNotifications hook instead
 */
export function getNotifications(): Notification[] {
  try {
    return JSON.parse(localStorage.getItem("notifications") || "[]");
  } catch {
    return [];
  }
}

/**
 * Clear all localStorage notifications (legacy)
 * @deprecated Use useNotifications hook instead
 */
export function clearNotifications() {
  localStorage.setItem("notifications", "[]");
}
