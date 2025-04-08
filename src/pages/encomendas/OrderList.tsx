
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import EmptyState from '@/components/common/EmptyState';
import { ClipboardList, Search, Plus, LogOut, ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

type SortField = 'number' | 'date' | 'clientName' | 'totalValue';
type SortDirection = 'asc' | 'desc';

const OrderList = () => {
  const navigate = useNavigate();
  const { orders, deleteOrder } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const filteredOrders = orders.filter(order => 
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'number') {
      return sortDirection === 'asc' 
        ? a.number.localeCompare(b.number)
        : b.number.localeCompare(a.number);
    } else if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === 'clientName') {
      return sortDirection === 'asc' 
        ? (a.clientName || '').localeCompare(b.clientName || '')
        : (b.clientName || '').localeCompare(a.clientName || '');
    } else if (sortField === 'totalValue') {
      const aTotal = a.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      const bTotal = b.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      return sortDirection === 'asc' ? aTotal - bTotal : bTotal - aTotal;
    }
    return 0;
  });

  const handleViewOrder = (id: string) => {
    navigate(`/encomendas/${id}`);
  };

  const handleEditOrder = (id: string) => {
    navigate(`/encomendas/editar/${id}`);
  };

  const handleCreateStockExit = (orderId: string) => {
    navigate(`/encomendas/converter/${orderId}`);
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      toast.success("Encomenda eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao eliminar encomenda");
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Encomendas" 
        description="Veja e gerencie as encomendas pendentes"
        actions={
          <Button onClick={() => navigate('/encomendas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              placeholder="Pesquisar por cliente, produto ou número..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {sortedOrders.length === 0 ? (
          <EmptyState 
            icon={<ClipboardList className="w-12 h-12 text-gestorApp-gray" />}
            title="Nenhuma encomenda encontrada"
            description="Não existem encomendas registadas ou que correspondam à pesquisa."
            action={
              <Button onClick={() => navigate('/encomendas/nova')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('number')}
                  >
                    <span className="flex items-center">
                      Número {getSortIcon('number')}
                    </span>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('date')}
                  >
                    <span className="flex items-center">
                      Data {getSortIcon('date')}
                    </span>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('clientName')}
                  >
                    <span className="flex items-center">
                      Cliente {getSortIcon('clientName')}
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Produtos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Qtd. Total
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('totalValue')}
                  >
                    <span className="flex items-center">
                      Valor Total {getSortIcon('totalValue')}
                    </span>
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
                {sortedOrders.map((order) => {
                  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const totalValue = order.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
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
                        {order.items.length > 1 
                          ? `${order.items[0].productName} e mais ${order.items.length - 1}` 
                          : order.items[0]?.productName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {totalItems}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {totalValue.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.convertedToStockExitId ? (
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 mr-2">
                              Convertida
                            </span>
                            <Link 
                              to={`/saidas/editar/${order.convertedToStockExitId}`}
                              className="text-gestorApp-blue hover:underline flex items-center"
                            >
                              <LogOut className="w-3 h-3 mr-1" />
                              {order.convertedToStockExitNumber}
                            </Link>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewOrder(order.id)}
                          className="mr-2"
                        >
                          Ver
                        </Button>
                        {!order.convertedToStockExitId && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditOrder(order.id)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleCreateStockExit(order.id)}
                              className="mr-2"
                            >
                              Converter em Saída
                            </Button>
                            <DeleteConfirmDialog
                              title="Eliminar Encomenda"
                              description="Tem a certeza que deseja eliminar esta encomenda? Esta ação é irreversível."
                              onDelete={() => handleDeleteOrder(order.id)}
                              trigger={
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
