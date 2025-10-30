import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Package, ShoppingCart, Trash2 } from "lucide-react";
import { getNotifications, clearNotifications } from "@/utils/alertsService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import PageHeader from "@/components/ui/PageHeader";

interface Notification {
  id: string;
  type: "stock" | "order";
  message: string;
  description?: string;
  date: string;
}

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => {
    const stored = getNotifications();
    setNotifications(stored);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleClearAll = () => {
    clearNotifications();
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <Package className="h-5 w-5 text-orange-500" />;
      case "order":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stock":
        return "Stock Baixo";
      case "order":
        return "Encomenda Atrasada";
      default:
        return "Notificação";
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notificações"
        description="Histórico de alertas automáticos do sistema"
        actions={
          notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Tudo
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhuma notificação recente</p>
              <p className="text-sm text-muted-foreground mt-1">
                Os alertas automáticos aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-foreground">
                        {notification.message}
                      </p>
                      <Badge variant="outline" className="shrink-0">
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </div>
                    
                    {notification.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.date), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsList;
