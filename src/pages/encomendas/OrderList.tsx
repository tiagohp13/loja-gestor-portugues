
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, Plus, ArrowUp, ArrowDown, ShoppingCart } from 'lucide-react';
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
import { toast } from '@/components/ui/use-toast';
import StatusBadge from '@/components/common/StatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import OrderMobileCard from "./components/OrderMobileCard";
import OrderTable from "./components/OrderTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OrderList = () => {
  const navigate = useNavigate();
  const { orders, deleteOrder, setOrders } = useData();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  
  const filteredOrders = localOrders.filter(order => 
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Always prioritize pending orders at the top
    const aPending = !a.convertedToStockExitId;
    const bPending = !b.convertedToStockExitId;
    
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    
    // Then sort by the selected field
    if (sortField === 'number') {
      return sortOrder === 'asc' 
        ? a.number.localeCompare(b.number) 
        : b.number.localeCompare(a.number);
    }
    
    if (sortField === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortField === 'clientName') {
      return sortOrder === 'asc' 
        ? (a.clientName || '').localeCompare(b.clientName || '') 
        : (b.clientName || '').localeCompare(a.clientName || '');
    }
    
    if (sortField === 'value') {
      const valueA = calculateOrderTotal(a);
      const valueB = calculateOrderTotal(b);
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    if (sortField === 'status') {
      const statusA = a.convertedToStockExitId ? 1 : 0;
      const statusB = b.convertedToStockExitId ? 1 : 0;
      return sortOrder === 'asc' ? statusA - statusB : statusB - statusA;
    }
    
    return 0;
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
        toast({
          title: "Erro",
          description: "Erro ao carregar encomendas",
          variant: "destructive",
        });
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
      toast({
        title: "Erro",
        description: "Erro ao carregar encomendas",
        variant: "destructive",
      });
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

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      // Toggle sort order if clicking on the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending order
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />;
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
      
      toast({
        title: "Sucesso",
        description: "Encomenda eliminada com sucesso",
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar encomenda",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <PageHeader 
        title="Consultar Encomendas" 
        description="Consulte e gerencie as suas encomendas" 
      />
      
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-4 sm:mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
          <div className="relative w-full flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
              <Input
                className="pl-10"
                placeholder="Pesquisar por cliente ou número da encomenda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate('/encomendas/nova')}>
              <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
            </Button>
          </div>
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
            {sortedOrders.map((order) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                calculateOrderTotal={calculateOrderTotal}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('number')}
                  >
                    Nº Encomenda {getSortIcon('number')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('date')}
                  >
                    Data {getSortIcon('date')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('clientName')}
                  >
                    Cliente {getSortIcon('clientName')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('value')}
                  >
                    Valor {getSortIcon('value')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('status')}
                  >
                    Estado {getSortIcon('status')}
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
                      {format(new Date(order.date), "dd/MM/yyyy", { locale: pt })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {order.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {formatCurrency(calculateOrderTotal(order))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {order.convertedToStockExitId ? (
                        <StatusBadge variant="success" icon={ShoppingCart}>
                          Convertida em Saída
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="warning">
                          Pendente
                        </StatusBadge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div onClick={(e) => e.stopPropagation()} className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => handleEditOrder(e, order.id)}
                                  disabled={order.convertedToStockExitId !== null}
                                  className={order.convertedToStockExitId !== null ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {order.convertedToStockExitId !== null && (
                              <TooltipContent>
                                <p>Não pode editar encomendas já convertidas em saída.</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
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
                                      disabled={order.convertedToStockExitId !== null}
                                      className={order.convertedToStockExitId !== null ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  }
                                  disabled={order.convertedToStockExitId !== null}
                                />
                              </span>
                            </TooltipTrigger>
                            {order.convertedToStockExitId !== null && (
                              <TooltipContent>
                                <p>Não pode eliminar encomendas já convertidas em saída.</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
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
