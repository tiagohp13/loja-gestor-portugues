import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, CheckCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import { checkOrderDependencies } from "@/utils/dependencyUtils";

const OrderList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reordena automaticamente sempre que 'orders' muda
  useEffect(() => {
    const sortOrders = (orders: Order[]) => {
      return [...orders].sort((a, b) => {
        const getPriority = (order: Order) => {
          if (order.convertedToStockExitId) return 3; // convertidas → último
          if (order.orderType === "awaiting_stock") return 2; // pendente stock → meio
          return 1; // combinadas → primeiro
        };

        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;

        // Mesma prioridade → ordenar por datas
        let dateA = 0;
        let dateB = 0;

        if (priorityA === 1) {
          // combinadas → data de entrega
          dateA = a.expectedDeliveryDate ? new Date(a.expectedDeliveryDate).getTime() : 0;
          dateB = b.expectedDeliveryDate ? new Date(b.expectedDeliveryDate).getTime() : 0;
        } else {
          // pendente stock ou convertidas → data da encomenda
          dateA = new Date(a.date).getTime();
          dateB = new Date(b.date).getTime();
        }

        if (dateA !== dateB) return dateB - dateA; // mais recente primeiro

        // Desempate → número da encomenda
        return a.number.localeCompare(b.number, undefined, { numeric: true });
      });
    };

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
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data: ordersData, error: ordersError } = await supabase.from("orders").select(`*, order_items(*)`);
      if (ordersError) throw ordersError;

      if (ordersData) {
        console.log("🧾 Primeira encomenda (ordersData[0]):", ordersData[0]);

        const formattedOrders: Order[] = ordersData.map((order) => ({
          id: order.id,
          number: order.number,
          clientId: order.client_id || "",
          clientName: order.client_name || "",
          date: order.date,
          notes: order.notes || "",
          convertedToStockExitId: order.converted_to_stock_exit_id,
          convertedToStockExitNumber: order.converted_to_stock_exit_number,
          discount: Number(order.discount || 0),
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          orderType: (order.order_type as "combined" | "awaiting_stock") || "combined",
          expectedDeliveryDate: order.expected_delivery_date,
          expectedDeliveryTime: order.expected_delivery_time,
          deliveryLocation: order.delivery_location,
          items: (order.order_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id || "",
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: Number(item.sale_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
          total:
            (order.order_items || []).reduce((sum: number, item: any) => {
              const itemTotal = item.quantity * Number(item.sale_price);
              const itemDiscount = Number(item.discount_percent || 0);
              const discountAmount = itemTotal * (itemDiscount / 100);
              return sum + (itemTotal - discountAmount);
            }, 0) *
            (1 - Number(order.discount || 0) / 100),
        }));

        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Erro ao carregar encomendas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteDialog.orderId) return;
    if (!validatePermission(canDelete, "eliminar encomendas")) {
      setDeleteDialog({ open: false, orderId: null });
      return;
    }

    try {
      const { error: itemsError } = await supabase.from("order_items").delete().eq("order_id", deleteDialog.orderId);
      if (itemsError) throw itemsError;

      const { error: orderError } = await supabase.from("orders").delete().eq("id", deleteDialog.orderId);
      if (orderError) throw orderError;

      setOrders(orders.filter((o) => o.id !== deleteDialog.orderId));
      toast.success("Encomenda eliminada com sucesso");
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

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeader title="Consultar Encomendas" description="Consulte e gerencie as suas encomendas" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gestorApp-blue mx-auto"></div>
            <p className="mt-2 text-gestorApp-gray">A carregar encomendas...</p>
          </div>
        </div>
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
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
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
                        <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(order.date)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{order.clientName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                            <div className="text-sm text-gray-900 dark:text-gray-100">
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
    </div>
  );
};

export default OrderList;
