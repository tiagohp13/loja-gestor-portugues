
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { Search, Plus, ChevronUp, ChevronDown, Eye, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatting';
import EmptyState from '@/components/common/EmptyState';
import { StockExit } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type SortField = 'exitNumber' | 'date' | 'reason' | 'total';
type SortDirection = 'asc' | 'desc';

const StockExitList = () => {
  const navigate = useNavigate();
  const { stockExits } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExits, setFilteredExits] = useState<StockExit[]>([]);
  const [loading, setLoading] = useState(true);
  const [localExits, setLocalExits] = useState<StockExit[]>([]);
  const [sortField, setSortField] = useState<SortField>('exitNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchExits();
  }, []);

  const fetchExits = async () => {
    setLoading(true);
    try {
      // Buscar dados diretamente da tabela
      const { data: exitsData, error: exitsError } = await supabase
        .from('StockExits')
        .select('*')
        .order('createdat', { ascending: false });

      if (exitsError) {
        throw exitsError;
      }

      if (!exitsData) {
        throw new Error("Não foram encontradas saídas");
      }

      // Transformar os dados retornados
      const exitsWithItems = await Promise.all(
        exitsData.map(async (exit) => {
          // Buscar itens para cada saída diretamente da tabela
          const { data: itemsData, error: itemsError } = await supabase
            .from('StockExitsItems')
            .select('*')
            .eq('exitid', exit.id);

          if (itemsError) {
            console.error(`Erro ao buscar itens da saída ${exit.id}:`, itemsError);
            return {
              id: exit.id,
              clientId: exit.clientid,
              clientName: exit.clientname,
              reason: exit.reason,
              exitNumber: exit.exitnumber,
              date: exit.date,
              invoiceNumber: exit.invoicenumber,
              notes: exit.notes,
              status: (exit.status as "pending" | "completed" | "cancelled"),
              discount: exit.discount,
              fromOrderId: exit.fromorderid,
              createdAt: exit.createdat,
              updatedAt: exit.updatedat,
              items: []
            } as StockExit;
          }

          // Mapear items para o formato esperado em StockExitItem[]
          const mappedItems = (itemsData || []).map(item => ({
            productId: item.productid,
            productName: item.productname,
            quantity: item.quantity,
            salePrice: item.saleprice,
            discount: item.discount || 0
          }));

          // Retornar a saída com seus itens mapeados
          return {
            id: exit.id,
            clientId: exit.clientid,
            clientName: exit.clientname,
            reason: exit.reason,
            exitNumber: exit.exitnumber,
            date: exit.date,
            invoiceNumber: exit.invoicenumber,
            notes: exit.notes,
            status: (exit.status as "pending" | "completed" | "cancelled"),
            discount: exit.discount,
            fromOrderId: exit.fromorderid,
            createdAt: exit.createdat,
            updatedAt: exit.updatedat,
            items: mappedItems
          } as StockExit;
        })
      );
        
      setLocalExits(exitsWithItems);
    } catch (err) {
      console.error('Erro ao buscar saídas:', err);
      toast.error('Erro ao carregar as saídas');
      // Fallback to local data
      setLocalExits(stockExits);
    } finally {
      setLoading(false);
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
    let results = [...localExits];
    
    if (searchTerm) {
      results = results.filter(
        exit => 
          (exit.reason && exit.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (exit.exitNumber && exit.exitNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (exit.clientName && exit.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'exitNumber':
          comparison = (a.exitNumber || '').localeCompare(b.exitNumber || '');
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'reason':
          comparison = (a.reason || '').localeCompare(b.reason || '');
          break;
        case 'total':
          const totalA = a.items && a.items.length > 0 
            ? a.items.reduce((sum, item) => sum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 0)
            : 0;
          const totalB = b.items && b.items.length > 0 
            ? b.items.reduce((sum, item) => sum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 0)
            : 0;
          comparison = totalA - totalB;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredExits(results);
  }, [localExits, searchTerm, sortField, sortDirection]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Saídas" 
        description="Consulte e gerencie saídas de stock" 
        actions={
          <Button onClick={() => navigate('/saidas/nova')}>
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
          <Button variant="outline" onClick={fetchExits}>
            Atualizar
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Carregando saídas...</p>
          </div>
        ) : filteredExits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('exitNumber')}
                  >
                    Número {renderSortIcon('exitNumber')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Data {renderSortIcon('date')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('reason')}
                  >
                    Motivo {renderSortIcon('reason')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    Valor {renderSortIcon('total')}
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
                  // Calculate exit total with item discounts
                  const total = exit.items && exit.items.length > 0 
                    ? exit.items.reduce(
                        (sum, item) => sum + (item.quantity * item.salePrice * (1 - (item.discount || 0) / 100)), 
                        0
                      )
                    : 0;
                  
                  return (
                    <tr key={exit.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gestorApp-blue">
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
                        {exit.items ? exit.items.length : 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/saidas/${exit.id}`)}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/saidas/editar/${exit.id}`)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
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
            title="Nenhuma saída encontrada" 
            description="Não existem saídas de stock que correspondam à sua pesquisa."
            action={
              <Button onClick={() => navigate('/saidas/nova')}>
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
