
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Truck, Plus, Search, ArrowDown, ArrowUp, Trash, Eye, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StockEntry } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const StockEntryList = () => {
  const navigate = useNavigate();
  const { stockEntries, deleteStockEntry: contextDeleteStockEntry } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof StockEntry | 'totalValue'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('StockEntries')
        .select('*')
        .order('createdat', { ascending: false });

      if (entriesError) {
        throw entriesError;
      }

      if (entriesData) {
        const entriesWithItems = await Promise.all(
          entriesData.map(async entry => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('StockEntriesItems')
              .select('*')
              .eq('entryid', entry.id);

            if (itemsError) {
              console.error(`Error fetching items for entry ${entry.id}:`, itemsError);
              return {
                ...entry,
                items: []
              };
            }

            const mappedItems = itemsData?.map(item => ({
              productId: item.productid,
              productName: item.productname,
              quantity: item.quantity,
              purchasePrice: item.purchaseprice,
              discount: item.discount ?? 0
            })) || [];

            // Transform database column names to match our TypeScript interface
            return {
              id: entry.id,
              supplierId: entry.supplierid,
              supplierName: entry.suppliername,
              entryNumber: entry.entrynumber,
              date: entry.date,
              invoiceNumber: entry.invoicenumber,
              notes: entry.notes,
              status: entry.status as 'pending' | 'completed' | 'cancelled',
              discount: 0, // We're keeping this at 0 since we removed the discount functionality
              createdAt: entry.createdat,
              updatedAt: entry.updatedat,
              items: mappedItems
            } as StockEntry;
          })
        );
        
        setEntries(entriesWithItems);
      }
    } catch (error) {
      console.error('Error fetching stock entries:', error);
      toast.error('Erro ao buscar entradas de stock');
      setEntries(stockEntries);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof StockEntry | 'totalValue') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: keyof StockEntry | 'totalValue') => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="inline w-4 h-4 ml-1" /> 
      : <ArrowDown className="inline w-4 h-4 ml-1" />;
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await contextDeleteStockEntry(id);
      toast.success('Entrada eliminada com sucesso');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Erro ao eliminar entrada');
    }
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    let results = [...entries];
    
    if (searchTerm) {
      results = results.filter(
        entry => 
          (entry.supplierName && entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.entryNumber && entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'entryNumber':
          comparison = (a.entryNumber || '').localeCompare(b.entryNumber || '');
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'supplierName':
          comparison = (a.supplierName || '').localeCompare(b.supplierName || '');
          break;
        case 'totalValue':
          const totalA = a.items && a.items.length > 0 
            ? a.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice * (1 - (item.discount || 0) / 100)), 0)
            : 0;
          const totalB = b.items && b.items.length > 0 
            ? b.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice * (1 - (item.discount || 0) / 100)), 0)
            : 0;
          comparison = totalA - totalB;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setEntries(results);
  }, [entries, searchTerm, sortField, sortDirection]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Entradas" 
        description="Consulte e gerencie entradas de stock" 
        actions={
          <Button onClick={() => navigate('/entradas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Entrada
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por fornecedor ou número..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchEntries}>
            Atualizar
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Carregando entradas...</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('entryNumber')}
                  >
                    Número {renderSortIcon('entryNumber')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Data {renderSortIcon('date')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('supplierName')}
                  >
                    Fornecedor {renderSortIcon('supplierName')}
                  </th>
                  <th 
                    className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark cursor-pointer"
                    onClick={() => handleSort('totalValue')}
                  >
                    Valor {renderSortIcon('totalValue')}
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
                {entries.map(entry => {
                  const total = entry.items && entry.items.length > 0 
                    ? entry.items.reduce(
                        (sum, item) => sum + (item.quantity * item.purchasePrice * (1 - (item.discount || 0) / 100)), 
                        0
                      )
                    : 0;
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gestorApp-blue">
                        {entry.entryNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 px-4">
                        {entry.supplierName || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {entry.items ? entry.items.length : 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/entradas/${entry.id}`)}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/entradas/editar/${entry.id}`)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedEntryId(entry.id)}
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
            title="Nenhuma entrada encontrada" 
            description="Não existem entradas de stock que correspondam à sua pesquisa."
            action={
              <Button onClick={() => navigate('/entradas/nova')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Entrada
              </Button>
            }
          />
        )}
      </div>

      <DeleteConfirmDialog
        title="Eliminar Entrada de Stock"
        description="Tem certeza que deseja eliminar esta entrada? Esta ação não pode ser desfeita."
        onDelete={() => selectedEntryId && handleDeleteEntry(selectedEntryId)}
        open={!!selectedEntryId}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default StockEntryList;
