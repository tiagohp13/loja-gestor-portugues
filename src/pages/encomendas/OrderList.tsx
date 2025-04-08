
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import { Search, Plus, ChevronUp, ChevronDown, Filter, Eye, Pencil, ArrowRightLeft, Ban, Trash } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatting';
import EmptyState from '@/components/common/EmptyState';
import { Order } from '@/types';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type SortField = 'orderNumber' | 'date' | 'clientName' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

const OrderList = () => {
  const navigate = useNavigate();
  const { orders, updateOrder, deleteOrder, convertOrderToStockExit } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortField, setSortField] = useState<SortField>('orderNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch data directly from the table
      const { data: ordersData, error: ordersError } = await supabase
        .from('Encomendas')
        .select('*')
        .order('createdat', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      if (!ordersData) {
        throw new Error("No orders found");
      }

      // Transform the returned data
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          // Fetch items for each order directly from the table
          const { data: itemsData, error: itemsError } = await supabase
            .from('EncomendasItems')
            .select('*')
            .eq('encomendaid', order.id);

          if (itemsError) {
            console.error(`Error fetching items for order ${order.id}:`, itemsError);
            return {
              id: order.id,
              clientId: order.clientid,
              clientName: order.clientname,
              orderNumber: order.ordernumber,
              date: order.date,
              notes: order.notes,
              status: (order.status as "pending" | "completed" | "cancelled"),
              discount: order.discount || 0,
              convertedToStockExitId: order.convertedtostockexitid,
              createdAt: order.createdat,
              updatedAt: order.updatedat,
              items: []
            } as Order;
          }

          // Map items to the expected format in OrderItem[]
          const mappedItems = (itemsData || []).map(item => ({
            productId: item.productid,
            productName: item.productname,
            quantity: item.quantity,
            salePrice: item.saleprice,
            discount: item.discount || 0
          }));

          // Return the order with its mapped items
          return {
            id: order.id,
            clientId: order.clientid,
            clientName: order.clientname,
            orderNumber: order.ordernumber,
            date: order.date,
            notes: order.notes,
            status: (order.status as "pending" | "completed" | "cancelled"),
            discount: order.discount || 0,
            convertedToStockExitId: order.convertedtostockexitid,
            createdAt: order.createdat,
            updatedAt: order.updatedat,
            items: mappedItems
          } as Order;
        })
      );
        
      setLocalOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Error loading orders');
      // Fallback to local data
      setLocalOrders(orders);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      await updateOrder(id, { status: 'cancelled' });

      // Update in Supabase
      const { error } = await supabase
        .from('Encomendas')
        .update({ 
          status: 'cancelled',
          updatedat: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Encomenda cancelada com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Erro ao cancelar encomenda');
    }
  };
  
  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      
      // Delete from Supabase
      // First delete items
      const { error: itemsError } = await supabase
        .from('EncomendasItems')
        .delete()
        .eq('encomendaid', id);
      
      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
      }
      
      // Then delete order
      const { error } = await supabase
        .from('Encomendas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Encomenda eliminada com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao eliminar encomenda');
    }
    setOrderToDelete(null);
  };
  
  const handleConvertOrder = async (id: string) => {
    try {
      await convertOrderToStockExit(id);
      toast.success('Encomenda convertida em saída com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error converting order to exit:', error);
      toast.error('Erro ao converter encomenda em saída');
    }
  };
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline w-4 h-4 ml-1" /> 
      : <ChevronDown className="inline w-4 h-4 ml-1" />;
  };

  useEffect(() => {
    let results = [...localOrders];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        order => 
          order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'orderNumber':
          comparison = (a.orderNumber || '').localeCompare(b.orderNumber || '');
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'clientName':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'total':
          const totalA = a.items.reduce((sum, item) => sum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 0);
          const totalB = b.items.reduce((sum, item) => sum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 0);
          comparison = totalA - totalB;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(results);
  }, [localOrders, searchTerm, sortField, sortDirection, statusFilter]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Encomendas" 
        description="Consulte e gerencie encomendas de clientes" 
        actions={
          <Button onClick={() => navigate('/encomendas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar encomendas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gestorApp-gray" />
            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={fetchOrders}>
            Atualizar
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Carregando encomendas...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer" 
                    onClick={() => handleSort('orderNumber')}
                  >
                    Número {renderSortIcon('orderNumber')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer" 
                    onClick={() => handleSort('date')}
                  >
                    Data {renderSortIcon('date')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer" 
                    onClick={() => handleSort('clientName')}
                  >
                    Cliente {renderSortIcon('clientName')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer" 
                    onClick={() => handleSort('total')}
                  >
                    Valor {renderSortIcon('total')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer" 
                    onClick={() => handleSort('status')}
                  >
                    Estado {renderSortIcon('status')}
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-gestorApp-gray-dark">
                    Itens
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-gestorApp-gray-dark">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => {
                  const total = order.items.reduce(
                    (sum, item) => sum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 
                    0
                  );
                  
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gestorApp-blue">
                        {order.orderNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {order.date ? formatDate(new Date(order.date)) : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {order.clientName}
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {order.items.length}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/encomendas/${order.id}`)}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {order.status !== 'cancelled' && !order.convertedToStockExitId && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate(`/encomendas/editar/${order.id}`)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleConvertOrder(order.id)}
                                title="Converter em Saída"
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCancelOrder(order.id)}
                                title="Cancelar Encomenda"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setOrderToDelete(order.id)}
                            title="Eliminar"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="Nenhuma encomenda encontrada" 
            description="Não existem encomendas que correspondam à sua pesquisa."
            action={
              <Button onClick={() => navigate('/encomendas/nova')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
              </Button>
            }
          />
        )}
      </div>
      
      {/* Confirmation Dialog for Delete */}
      <DeleteConfirmDialog
        open={!!orderToDelete}
        onOpenChange={() => setOrderToDelete(null)}
        onConfirm={() => orderToDelete && handleDeleteOrder(orderToDelete)}
        title="Eliminar Encomenda"
        description="Tem certeza que deseja eliminar esta encomenda? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default OrderList;
