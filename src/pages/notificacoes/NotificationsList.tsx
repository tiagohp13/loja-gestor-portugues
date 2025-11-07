import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Filter, Archive, Wifi, WifiOff } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useNotifications, NotificationType, NotificationPriority } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NotificationsList = () => {
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Active notifications
  const {
    notifications: activeNotifications,
    isLoading: isLoadingActive,
    unreadCount,
    highPriorityUnreadCount,
    realtimeConnected,
    markAsRead,
    markAllAsRead,
    archive,
    deleteNotification,
    archiveExpired,
  } = useNotifications({
    type: typeFilter !== "all" ? typeFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    unreadOnly: showUnreadOnly,
    showArchived: false,
  });

  // Archived notifications
  const { notifications: archivedNotifications, isLoading: isLoadingArchived } = useNotifications({
    showArchived: true,
  });

  const handleArchiveExpired = () => {
    archiveExpired();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Central de Notificações"
        description="Alertas e notificações do sistema em tempo real"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={realtimeConnected ? "default" : "secondary"} className="gap-1">
              {realtimeConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Tempo Real
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleArchiveExpired}>
              <Archive className="h-4 w-4 mr-2" />
              Arquivar expiradas
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="relative">
            Ativas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-2 py-0 h-5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">
            Histórico
            <Badge variant="secondary" className="ml-2 px-2 py-0 h-5 text-xs">
              {archivedNotifications.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações Ativas
                </div>
                <div className="flex items-center gap-2">
                  {highPriorityUnreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {highPriorityUnreadCount} urgentes
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="order">Encomendas</SelectItem>
                      <SelectItem value="request">Requisições</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                      <SelectItem value="client">Clientes</SelectItem>
                      <SelectItem value="supplier">Fornecedores</SelectItem>
                      <SelectItem value="general">Geral</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant={showUnreadOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                >
                  {showUnreadOnly ? "Mostrar todas" : "Apenas não lidas"}
                </Button>
              </div>

              {/* Notifications List */}
              {isLoadingActive ? (
                <div className="text-center py-12 text-muted-foreground">
                  A carregar notificações...
                </div>
              ) : activeNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    {showUnreadOnly ? "Sem notificações não lidas" : "Sem notificações"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {showUnreadOnly
                      ? "Todas as notificações estão lidas"
                      : "Novas notificações aparecerão aqui automaticamente"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onArchive={archive}
                      onDelete={deleteNotification}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Notificações Arquivadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingArchived ? (
                <div className="text-center py-12 text-muted-foreground">
                  A carregar histórico...
                </div>
              ) : archivedNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">Sem notificações arquivadas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Notificações arquivadas aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {archivedNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onArchive={archive}
                      onDelete={deleteNotification}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsList;
