import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationType = "stock" | "order" | "request" | "expense" | "client" | "supplier" | "general";
export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  link?: string;
  related_id?: string;
  read: boolean;
  archived: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  unreadOnly?: boolean;
  showArchived?: boolean;
}

export const useNotifications = (filters?: NotificationFilters) => {
  const queryClient = useQueryClient();
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ["notifications", filters],
    queryFn: async () => {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters?.unreadOnly) {
        query = query.eq("read", false);
      }
      if (filters?.showArchived !== undefined) {
        query = query.eq("archived", filters.showArchived);
      } else {
        // Default: don't show archived
        query = query.eq("archived", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Notification[];
    },
    staleTime: 30000, // 30 seconds
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          console.log("Notification change received:", payload);
          
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          
          // Show toast for new notifications
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as Notification;
            if (!newNotif.read) {
              toast.info(newNotif.title, {
                description: newNotif.message,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error("Erro ao marcar notificação como lida");
      console.error(error);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false)
        .eq("archived", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Todas as notificações marcadas como lidas");
    },
    onError: (error) => {
      toast.error("Erro ao marcar todas como lidas");
      console.error(error);
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ archived: true, read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação arquivada");
    },
    onError: (error) => {
      toast.error("Erro ao arquivar notificação");
      console.error(error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação eliminada");
    },
    onError: (error) => {
      toast.error("Erro ao eliminar notificação");
      console.error(error);
    },
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, "id" | "user_id" | "created_at" | "updated_at" | "read" | "archived">) => {
      const { error } = await supabase
        .from("notifications")
        .insert([{
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          link: notification.link,
          related_id: notification.related_id,
          expires_at: notification.expires_at,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Archive expired notifications
  const archiveExpiredMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("archive_expired_notifications");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Calculate counts
  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityUnreadCount = notifications.filter(
    (n) => !n.read && n.priority === "high"
  ).length;

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    highPriorityUnreadCount,
    realtimeConnected,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    archive: archiveMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    createNotification: createNotificationMutation.mutate,
    archiveExpired: archiveExpiredMutation.mutate,
  };
};
