import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { Search, Plus, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatting';
import EmptyState from '@/components/common/EmptyState';
import { StockExit } from '@/types';

const StockExitList = () => {
  const navigate = useNavigate();
  const { stockExits } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExits, setFilteredExits] = useState<StockExit[]>([]);

  useEffect(() => {
    let results = [...stockExits];
    
    if (searchTerm) {
      results = results.filter(
        exit => 
          exit.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exit.exitNumber && exit.exitNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredExits(results);
  }, [stockExits, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Saídas" 
        description="Consulte e gerencie saídas de stock" 
        actions={
          <Button onClick={() => navigate('/saidas/novo')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Saída
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar saídas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredExits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark">
                    Número
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark">
                    Data
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark">
                    Motivo
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark">
                    Valor
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
                {filteredExits.map(exit => {
                  // Calculate exit total with discount
                  const subtotal = exit.items.reduce(
                    (sum, item) => sum + (item.quantity * item.salePrice), 
                    0
                  );
                  const discount = subtotal * (exit.discount / 100);
                  const total = subtotal - discount;
                  
                  return (
                    <tr key={exit.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gestorApp-blue cursor-pointer" onClick={() => navigate(`/saidas/editar/${exit.id}`)}>
                        {exit.exitNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(exit.date)}
                      </td>
                      <td className="py-3 px-4">
                        {exit.reason}
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {exit.items.length}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/saidas/editar/${exit.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="Nenhuma saída encontrada" 
            description="Não existem saídas de stock que correspondam à sua pesquisa."
            action={
              <Button onClick={() => navigate('/saidas/novo')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Saída
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default StockExitList;
