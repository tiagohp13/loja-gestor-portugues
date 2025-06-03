import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

const OrderList = () => {
  const navigate = useNavigate();
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
    if (!deleteDialog.orderId) return;

    try {
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', deleteDialog.orderId);

      if (itemsError) throw itemsError;

      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', deleteDialog.orderId);

      if (orderError) throw orderError;

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
        <PageHeader title="Encomendas" />
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
      <PageHeader title="Encomendas" />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Histórico de Encomendas</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray w-4 h-4" />
                <Input
                  placeholder="Pesquisar encomendas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button onClick={() => navigate('/encomendas/nova')}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Encomenda
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <EmptyState 
              title="Nenhuma encomenda encontrada"
              description={searchTerm ? "Tente ajustar os filtros de pesquisa." : "Comece por adicionar uma nova encomenda."}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Badge variant="outline">{order.number}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total || 0)}
                    </TableCell>
                    <TableCell>
                      {order.convertedToStockExitId ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Convertida
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/encomendas/${order.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, orderId: order.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog 
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, orderId: null })}
        onDelete={handleDeleteOrder}
        title="Eliminar Encomenda"
        description="Tem a certeza que pretende eliminar esta encomenda? Esta ação não pode ser desfeita."
        trigger={<div style={{ display: 'none' }} />}
      />
    </div>
  );
};

export default OrderList;
