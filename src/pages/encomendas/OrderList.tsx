
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import EmptyState from '@/components/common/EmptyState';
import { ClipboardList, Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const OrderList = () => {
  const navigate = useNavigate();
  const { orders } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOrders = orders.filter(order => 
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewOrder = (id: string) => {
    navigate(`/encomendas/${id}`);
  };

  const handleCreateStockExit = (orderId: string) => {
    navigate(`/encomendas/converter/${orderId}`);
  };

  // Helper to calculate total value of an order
  const calculateOrderTotal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;
    
    return order.items.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
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
              placeholder="Pesquisar por cliente ou produto..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Produtos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Qtd. Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const totalValue = order.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
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
                          <Button 
                            size="sm" 
                            onClick={() => handleCreateStockExit(order.id)}
                          >
                            Converter em Saída
                          </Button>
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
