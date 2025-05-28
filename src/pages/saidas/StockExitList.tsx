import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import RecordCount from '@/components/common/RecordCount';
import { Search, Plus, LogOut } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const StockExitList = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { stockExits } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExits = stockExits.filter(exit =>
    exit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exit.clientName && exit.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewExit = (id: string) => {
    navigate(`/saidas/${id}`);
  };

  const handleEditExit = (id: string) => {
    navigate(`/saidas/editar/${id}`);
  };

  const handleAddExit = () => {
    navigate('/saidas/nova');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Vendas" 
        description="Consultar e gerir o histórico de vendas"
        actions={
          <Button onClick={handleAddExit}>
            <Plus className="h-4 w-4" />
            Nova Venda
          </Button>
        }
      />
      
      <RecordCount 
        title="Total de vendas"
        count={stockExits.length}
        icon={LogOut}
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por número ou cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Número</th>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredExits.map(exit => (
                <tr 
                  key={exit.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewExit(exit.id)}
                >
                  <td className="p-3 font-medium">{exit.number}</td>
                  <td className="p-3">{new Date(exit.date).toLocaleDateString('pt-PT')}</td>
                  <td className="p-3">{exit.clientName || 'Cliente Geral'}</td>
                  <td className="p-3">
                    {exit.items ? exit.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2) : '0.00'} €
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditExit(exit.id);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredExits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockExitList;
