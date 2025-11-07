import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationIcon } from "./NotificationIcon";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications({
    unreadOnly: false,
    showArchived: false,
  });

  // Get latest 5 notifications
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} não lidas
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Sem notificações</p>
            </div>
          ) : (
            <>
              {recentNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5">
                    <NotificationIcon
                      type={notification.type}
                      priority={notification.priority}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-center justify-center font-medium text-primary cursor-pointer"
          onClick={() => navigate("/notificacoes")}
        >
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
