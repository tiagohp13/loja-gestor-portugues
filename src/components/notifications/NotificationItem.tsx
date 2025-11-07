import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ExternalLink, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationIcon } from "./NotificationIcon";
import { Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete,
  showActions = true,
}: NotificationItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getPriorityLabel = () => {
    switch (notification.priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return "";
    }
  };

  const getPriorityVariant = () => {
    switch (notification.priority) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      case "low":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border transition-all",
        notification.read 
          ? "bg-background border-border" 
          : "bg-accent/30 border-accent hover:bg-accent/50",
        notification.link && "cursor-pointer",
        notification.archived && "opacity-60"
      )}
      onClick={notification.link ? handleClick : undefined}
    >
      <div className="mt-0.5">
        <NotificationIcon type={notification.type} priority={notification.priority} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-medium text-foreground leading-tight">
            {notification.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={getPriorityVariant()} className="text-xs">
              {getPriorityLabel()}
            </Badge>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          {notification.message}
        </p>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>

          {showActions && !notification.archived && (
            <div className="flex items-center gap-1">
              {notification.link && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              )}
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar lida
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(notification.id);
                }}
              >
                <Archive className="h-3 w-3 mr-1" />
                Arquivar
              </Button>
            </div>
          )}

          {notification.archived && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
