import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import { checkOrderDependencies } from "@/utils/dependencyUtils";
import { toast } from "sonner";

interface PendingOrdersProps {
  pendingOrders: Order[];
  navigateToOrderDetail: (id: string) => void;
  navigateToClientDetail?: (id: string) => void;
}

const PendingOrders: React.FC<PendingOrdersProps> = ({ pendingOrders, navigateToOrderDetail }) => {
  const { canEdit, canDelete } = usePermissions();

  // Ordenação fiel ao OrderList
  const sortedOrders = useMemo(() => {
    const getPriority = (order: Order) => {
      if (order.orderType === "combined" && !order.convertedToStockExitId) return 1;
      if (order.orderType === "awaiting_stock") return 2;
      return 3; // convertidas
    };

    return [...pendingOrders]
      .sort((a, b) => {
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;

        let dateA = 0;
        let dateB = 0;

        if (priorityA === 1) {
          dateA = a.expectedDeliveryDate ? new Date(a.expectedDeliveryDate).getTime() : 0;
          dateB = b.expectedDeliveryDate ? new Date(b.expectedDeliveryDate).getTime() : 0;
          if (dateA !== dateB) return dateA - dateB;
        } else {
          dateA = new Date(a.date).getTime();
          dateB = new Date(b.date).getTime();
          if (dateA !== dateB) return dateB - dateA;
        }

        return a.number.localeCompare(b.number, undefined, { numeric: true });
      })
      .slice(0, 5); // limitar a 5 encomendas
  }, [pendingOrders]);

  const formatDate = (dateStr: string) => (dateStr ? format(new Date(dateStr), "dd/MM/yyyy") : "—");

  const handleDelete = async (order: Order) => {
    if (!validatePermission(canDelete, "eliminar encomendas")) return;

    if (order.convertedToStockExitId) {
      toast.error("Não pode eliminar encomendas já convertidas em saída");
      return;
    }

    const deps = await checkOrderDependencies(order.id);
    if (!deps.canDelete) {
      toast.error(deps.message || "Não é possível eliminar esta encomenda");
      return;
    }

    // Trigger de delete externo via DashboardPage
    toast.info("A função de eliminar deve ser implementada no contexto do Dashboard");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Encomendas Pendentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sortedOrders.length === 0 ? (
          <div className="text-center p-6 text-gray-500">Não existem encomendas pendentes.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Encomenda</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Informações de Entrega</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => navigateToOrderDetail(order.id)}
                  >
                    <TableCell>
                      <span className="text-blue-600 hover:underline font-medium">{order.number}</span>
                    </TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.clientName || "—"}</TableCell>
                    <TableCell>{formatCurrency(order.total || 0)}</TableCell>
                    <TableCell>
                      {order.convertedToStockExitId ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Convertida em Saída
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          {order.orderType === "awaiting_stock"
                            ? "Pendente – A aguardar stock"
                            : "Pendente – Combinada"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.expectedDeliveryDate ? (
                        <div className="space-y-0.5 text-sm">
                          <div>{formatDate(order.expectedDeliveryDate)}</div>
                          {order.expectedDeliveryTime && (
                            <div className="text-xs text-gray-500">{order.expectedDeliveryTime}</div>
                          )}
                          {order.deliveryLocation && (
                            <div className="text-xs text-gray-500">{order.deliveryLocation}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!validatePermission(canEdit, "editar encomendas")) return;
                            toast.info("Editar deve ser implementado no contexto do Dashboard");
                          }}
                          disabled={!canEdit || !!order.convertedToStockExitId}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order);
                          }}
                          disabled={!canDelete || !!order.convertedToStockExitId}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingOrders;
