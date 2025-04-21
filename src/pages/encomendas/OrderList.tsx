import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, Plus, ArrowDownUp, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '@/utils/formatting';
import { Order } from '@/types';
import { supabase, addToDeletedCache, filterDeletedItems } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StatusBadge from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';

const OrderList = () => {
  const navigate = useNavigate();
  const { orders, deleteOrder, setOrders } = useData();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    return (localStorage.getItem('orderSortDirection') as 'asc' | 'desc') || 'desc';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    localStorage.setItem('orderSortDirection', sortOrder);
  }, [sortOrder]);
  
  const filteredOrders = localOrders.filter(order => 
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aPending = !a.convertedToStockExitId;
    const bPending = !b.convertedToStockExitId;
    
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  const fetchAllOrders = async () => {
    try {
      console.log("Fetching orders...");
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        toast.error("Erro ao carregar encomendas");
        return;
      }

      if (data) {
        console.log("Orders data received:", data);
        
        const mappedOrders = data.map(order => ({
          id: order.id,
          clientId: order.client_id,
          clientName: order.client_name,
          number: order.number,
          date: order.date,
          notes: order.notes,
          createdAt: order.created_at,
          convertedToStockExitId: order.converted_to_stock_exit_id,
          discount: order.discount,
          items: order.order_items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: item.sale_price,
            discountPercent: item.discount_percent
          }))
        }));
        
        const filteredOrders = filterDeletedItems('orders', mappedOrders);
        
        setLocalOrders(filteredOrders);
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      toast.error("Erro ao carregar encomendas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAllOrders();
  }, [setOrders]);

  useEffect(() => {
    console.log("Setting up realtime subscriptions for orders");
    
    const channel = supabase.channel('orders_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          console.log('Order change detected:', payload);
          fetchAllOrders();
        }
      )
      .subscribe((status) => {
        console.log('Orders subscription status:', status);
      });
      
    const itemsChannel = supabase.channel('order_items_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_items' }, 
        (payload) => {
          console.log('Order item change detected:', payload);
          fetchAllOrders();
        }
      )
      .subscribe((status) => {
        console.log('Order items subscription status:', status);
      });
    
    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(channel);
      supabase.removeChannel(itemsChannel);
    };
  }, []);

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
  };
  
  const handleViewOrder = (id: string) => {
    navigate(`/encomendas/${id}`);
  };
  
  const handleEditOrder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/encomendas/editar/${id}`);
  };
  
  const handleDeleteOrder = async (id: string) => {
    try {
      console.log("Deleting order:", id);
      
      addToDeletedCache('orders', id);
      
      setLocalOrders(prev => prev.filter(order => order.id !== id));
      
      const result = await deleteOrder(id);
      console.log("Delete result:", result);
      
      toast.success("Encomenda eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao eliminar encomenda");
    }
  };
  
  const calculateOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Consultar Encomendas" 
          description="A carregar dados..." 
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          Carregando encomendas...
        </div>
      </div>
    );
  }

  const renderMobileCard = (order: Order) => (
    <div 
      key={order.id}
      className="bg-white rounded-lg shadow p-4 mb-4 cursor-pointer hover:bg-gray-50"
      onClick={() => handleViewOrder(order.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gestorApp-blue">{order.number}</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => handleEditOrder(e, order.id)}
            disabled={order.convertedToStockExitId !== null}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmDialog
            title="Eliminar Encomenda"
            description="Tem a certeza que deseja eliminar esta encomenda?"
            onDelete={() => handleDeleteOrder(order.id)}
            trigger={
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div className="text-gestorApp-gray">Data:</div>
        <div>{format(new Date(order.date), 'dd/MM/yyyy', { locale: pt })}</div>
        
        <div className="text-gestorApp-gray">Cliente:</div>
        <div>{order.clientName}</div>
        
        <div className="text-gestorApp-gray">Valor:</div>
        <div>{formatCurrency(calculateOrderTotal(order))}</div>
        
        <div className="text-gestorApp-gray">Estado:</div>
        <div>
          {order.convertedToStockExitId ? (
            <StatusBadge variant="success" icon={ShoppingCart}>
              Convertida em Saída
            </StatusBadge>
          ) : (
            <StatusBadge variant="warning">
              Pendente
            </StatusBadge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <PageHeader 
        title="Consultar Encomendas" 
        description="Consulte e gerencie as suas encomendas"
        actions={
          <Button onClick={() => navigate('/encomendas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-4 sm:mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
          <div className="relative w-full md:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por cliente ou número da encomenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" onClick={toggleSortOrder} className="ml-auto flex items-center">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            {sortOrder === 'asc' ? 'Mais antigo primeiro' : 'Mais recente primeiro'}
          </Button>
        </div>
        
        {sortedOrders.length === 0 ? (
          <EmptyState 
            title="Nenhuma encomenda encontrada"
            description="Não existem encomendas registadas ou que correspondam à pesquisa."
            action={
              <Button onClick={() => navigate('/encomendas/nova')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
              </Button>
            }
          />
        ) : isMobile ? (
          <div className="space-y-4">
            {sortedOrders.map(renderMobileCard)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Nº Encomenda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
                      {order.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {format(new Date(order.date), 'dd/MM/yyyy', { locale: pt })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {order.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {formatCurrency(calculateOrderTotal(order))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {order.convertedToStockExitId ? (
                        <StatusBadge 
                          variant="success" 
                          icon={ShoppingCart}
                        >
                          Convertida em Saída
                        </StatusBadge>
                      ) : (
                        <StatusBadge 
                          variant="warning"
                        >
                          Pendente
                        </StatusBadge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div onClick={(e) => e.stopPropagation()} className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleEditOrder(e, order.id)}
                          disabled={order.convertedToStockExitId !== null}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteConfirmDialog
                          title="Eliminar Encomenda"
                          description="Tem a certeza que deseja eliminar esta encomenda?"
                          onDelete={() => handleDeleteOrder(order.id)}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
