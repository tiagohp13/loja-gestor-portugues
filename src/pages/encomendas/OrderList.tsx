
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, CheckCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';

const OrderList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    orderId: string | null;
  }>({ open: false, orderId: null });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(order =>
        order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        const formattedOrders: Order[] = ordersData.map(order => ({
          id: order.id,
          number: order.number,
          clientId: order.client_id || '',
          clientName: order.client_name || '',
          date: order.date,
          notes: order.notes || '',
          convertedToStockExitId: order.converted_to_stock_exit_id,
          convertedToStockExitNumber: order.converted_to_stock_exit_number,
          discount: Number(order.discount || 0),
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          items: (order.order_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: Number(item.sale_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          })),
          total: (order.order_items || []).reduce((sum: number, item: any) => {
            const itemTotal = item.quantity * Number(item.sale_price);
            const itemDiscount = Number(item.discount_percent || 0);
            const discountAmount = itemTotal * (itemDiscount / 100);
            return sum + (itemTotal - discountAmount);
          }, 0) * (1 - Number(order.discount || 0) / 100)
        }));

        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar encomendas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    console.log('handleDeleteOrder called with orderId:', deleteDialog.orderId);
    if (!deleteDialog.orderId) return;
    if (!validatePermission(canDelete, 'eliminar encomendas')) {
      setDeleteDialog({ open: false, orderId: null });
      return;
    }

    try {
      console.log('Starting delete process for order:', deleteDialog.orderId);
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', deleteDialog.orderId);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        throw itemsError;
      }
      console.log('Order items deleted successfully');

      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', deleteDialog.orderId);

      if (orderError) {
        console.error('Error deleting order:', orderError);
        throw orderError;
      }
      console.log('Order deleted successfully');

      setOrders(orders.filter(o => o.id !== deleteDialog.orderId));
      toast.success('Encomenda eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao eliminar encomenda');
    } finally {
      setDeleteDialog({ open: false, orderId: null });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

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

      {/* Card com total de encomendas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm font-medium">Total de encomendas: {filteredOrders.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Campo de pesquisa e botão Nova Encomenda */}
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
          <Button onClick={() => {
            if (!validatePermission(canCreate, 'criar encomendas')) return;
            navigate('/encomendas/nova');
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Encomenda
          </Button>
        )}
      </div>

      {/* Tabela de encomendas */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState 
                title="Nenhuma encomenda encontrada"
                description={searchTerm ? "Tente ajustar os filtros de pesquisa." : "Comece por adicionar uma nova encomenda."}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Nº ENCOMENDA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      DATA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      CLIENTE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      VALOR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      ESTADO
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            console.log("OrderList - Navigating to order detail with ID:", order.id);
                            navigate(`/encomendas/${order.id}`);
                          }}
                          className="text-sm font-medium text-gestorApp-blue hover:text-gestorApp-blue-dark underline"
                        >
                          {order.number}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {order.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark font-medium">
                        {formatCurrency(order.total || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.convertedToStockExitId ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Convertida em Saída
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                            Pendente
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (!validatePermission(canEdit, 'editar encomendas')) return;
                                navigate(`/encomendas/editar/${order.id}`);
                              }}
                              disabled={order.convertedToStockExitId !== null}
                              className={order.convertedToStockExitId !== null ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <DeleteConfirmDialog
                              open={deleteDialog.open && deleteDialog.orderId === order.id}
                              onClose={() => setDeleteDialog({ open: false, orderId: null })}
                              onDelete={handleDeleteOrder}
                              title="Eliminar Encomenda"
                              description="Tem a certeza que pretende eliminar esta encomenda? Esta ação não pode ser desfeita."
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Delete button clicked for order:', order.id);
                                    console.log('Order convertedToStockExitId:', order.convertedToStockExitId);
                                    console.log('canDelete permission:', canDelete);
                                    setDeleteDialog({ open: true, orderId: order.id });
                                  }}
                                  disabled={order.convertedToStockExitId !== null}
                                  className={order.convertedToStockExitId !== null ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              }
                            />
                          )}
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
