import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import OrderTable from './components/OrderTable';
import RecordCount from '@/components/common/RecordCount';
import { Plus, ClipboardList } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const OrderList = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { orders } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && !order.convertedToStockExitId) ||
                         (statusFilter === 'converted' && order.convertedToStockExitId);
                         
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (id: string) => {
    navigate(`/encomendas/${id}`);
  };

  const handleEditOrder = (id: string) => {
    navigate(`/encomendas/editar/${id}`);
  };

  const handleAddOrder = () => {
    navigate('/encomendas/nova');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Encomendas" 
        description="Consultar e gerir todas as encomendas"
        actions={
          <Button onClick={handleAddOrder}>
            <Plus className="h-4 w-4" />
            Nova Encomenda
          </Button>
        }
      />
      
      <RecordCount 
        title="Total de encomendas"
        count={orders.length}
        icon={ClipboardList}
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <OrderTable 
          orders={filteredOrders}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
        />
      </div>
    </div>
  );
};

export default OrderList;
