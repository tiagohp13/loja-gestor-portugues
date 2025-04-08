import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { Search, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatting';
import EmptyState from '@/components/common/EmptyState';
import { Order } from '@/types';

type SortField = 'orderNumber' | 'date' | 'clientName' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

const OrderList = () => {
  const navigate = useNavigate();
  const { orders } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortField, setSortField] = useState<SortField>('orderNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  useEffect(() => {
    let results = [...orders];
    
    if (searchTerm) {
      results = results.filter(
        order => 
          order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
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
          const totalA = a.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
          const totalB = b.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
          comparison = totalA - totalB;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(results);
  }, [orders, searchTerm, sortField, sortDirection]);
  
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
        </div>
        
        {filteredOrders.length > 0 ? (
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
                  <th className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark">
                    Desconto
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => {
                  const subtotal = order.items.reduce(
                    (sum, item) => sum + (item.quantity * item.salePrice), 
                    0
                  );
                  const discount = subtotal * (order.discount / 100);
                  const total = subtotal - discount;
                  
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/encomendas/${order.id}`)}
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
                        {formatCurrency(subtotal)}
                      </td>
                      <td className="py-3 px-4">
                        {order.discount ? `${order.discount}%` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {order.items.length}
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
    </div>
  );
};

export default OrderList;
