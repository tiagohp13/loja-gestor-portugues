import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, CheckCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import { checkOrderDependencies } from "@/utils/dependencyUtils";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { usePaginatedOrders } from "@/hooks/queries/usePaginatedOrders";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const OrderList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [currentPage, setCurrentPage] = useState(0);
  const { orders, totalCount, totalPages, isLoading, deleteOrder } = usePaginatedOrders(currentPage);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  });

  useEffect(() => {
    setFilteredOrders(sortOrders(orders));
  }, [orders]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(
        (order) =>
          order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.clientId?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredOrders(sortOrders(filtered));
    } else {
      setFilteredOrders(sortOrders(orders));
    }
  }, [searchTerm, orders]);

  const handleDeleteOrder = async () => {
    if (!deleteDialog.orderId) return;
    if (!validatePermission(canDelete, "eliminar encomendas")) {
      setDeleteDialog({ open: false, orderId: null });
      return;
    }

    try {
      // Verificar dependências antes de eliminar
      const deps = await checkOrderDependencies(deleteDialog.orderId);
      if (!deps.canDelete) {
        toast.error(deps.message || "Não é possível eliminar esta encomenda");
        setDeleteDialog({ open: false, orderId: null });
        return;
      }

      await deleteOrder(deleteDialog.orderId);
      // Dados atualizarão automaticamente via realtime
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao eliminar encomenda");
    } finally {
      setDeleteDialog({ open: false, orderId: null });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-PT");

  // Função de ordenação centralizada
  const sortOrders = (ordersToSort: Order[]) => {
    return [...ordersToSort].sort((a, b) => {
      const getPriority = (order: Order) => {
        if (order.orderType === "combined" && !order.convertedToStockExitId) return 1;
        if (order.orderType === "awaiting_stock") return 2;
        return 3;
      };

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
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Consultar Encomendas" description="Consulte e gerencie as suas encomendas" />
        <TableSkeleton title="A carregar encomendas..." rows={5} columns={6} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Consultar Encomendas" description="Consulte e gerencie as suas encomendas" />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm font-medium">Total de encomendas: {filteredOrders.length}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray w-4 h-4" />
          <Input
            placeholder="Pesquisar por cliente ou número da encomenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              if (!validatePermission(canCreate, "criar encomendas")) return;
              navigate("/encomendas/nova");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Encomenda
          </Button>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, orderId: null })}
        onDelete={handleDeleteOrder}
        title="Eliminar Encomenda"
        description="Tem a certeza que pretende eliminar esta encomenda? Esta ação não pode ser desfeita."
        trigger={<></>}
      />

      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Nenhuma encomenda encontrada"
                description={
                  searchTerm ? "Tente ajustar os filtros de pesquisa." : "Comece por adicionar uma nova encomenda."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Nº Encomenda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Informações de Entrega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => navigate(`/encomendas/${order.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{order.number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">{formatDate(order.date)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">{order.clientName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.convertedToStockExitId ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Convertida em Saída
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300">
                            {order.orderType === "awaiting_stock"
                              ? "Pendente – A aguardar stock"
                              : "Pendente – Combinada"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {order.expectedDeliveryDate ? (
                          <div className="space-y-0.5">
                            <div className="text-sm text-foreground">
                              {formatDate(order.expectedDeliveryDate)}
                            </div>
                            {order.expectedDeliveryTime && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {order.expectedDeliveryTime}
                              </div>
                            )}
                            {order.deliveryLocation && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{order.deliveryLocation}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-start items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!validatePermission(canEdit, "editar encomendas")) return;
                              navigate(`/encomendas/editar/${order.id}`);
                            }}
                            disabled={!canEdit || order.convertedToStockExitId !== null}
                            className="h-8 w-8 p-0"
                            title={
                              order.convertedToStockExitId
                                ? "Não é possível editar encomendas convertidas"
                                : "Editar encomenda"
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
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
                              setDeleteDialog({ open: true, orderId: order.id });
                            }}
                            disabled={!canDelete || order.convertedToStockExitId !== null}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                            title={
                              order.convertedToStockExitId
                                ? "Não é possível eliminar encomendas convertidas"
                                : "Eliminar encomenda"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i)}
                    isActive={currentPage === i}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default OrderList;
