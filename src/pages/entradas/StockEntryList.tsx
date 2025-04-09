
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '@/utils/formatting';
import { StockEntry } from '@/types';
import { supabase, addToDeletedCache, filterDeletedItems } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const StockEntryList = () => {
  const navigate = useNavigate();
  const { stockEntries, deleteStockEntry, setStockEntries } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [localEntries, setLocalEntries] = useState<StockEntry[]>([]);
  
  const filteredEntries = localEntries.filter(entry => 
    entry.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.invoiceNumber && entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  // Initial data load
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching stock entries directly in StockEntryList component...");
        
        const { data, error } = await supabase
          .from('stock_entries')
          .select(`
            *,
            stock_entry_items(*)
          `)
          .order('date', { ascending: false });

        if (error) {
          console.error("Error fetching stock entries:", error);
          toast.error("Erro ao carregar entradas de stock");
          return;
        }

        if (data) {
          console.log("Stock entries data received:", data);
          
          const mappedEntries = data.map(entry => ({
            id: entry.id,
            supplierId: entry.supplier_id,
            supplierName: entry.supplier_name,
            number: entry.number,
            invoiceNumber: entry.invoice_number,
            notes: entry.notes,
            date: entry.date,
            createdAt: entry.created_at,
            items: entry.stock_entry_items.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity,
              purchasePrice: item.purchase_price,
              discountPercent: item.discount_percent
            }))
          }));
          
          const filteredEntries = filterDeletedItems('stock_entries', mappedEntries);
          
          setLocalEntries(filteredEntries);
          setStockEntries(filteredEntries);
        }
      } catch (error) {
        console.error("Error in fetchEntries:", error);
        toast.error("Erro ao carregar entradas de stock");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [setStockEntries]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase.channel('stock_entries_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_entries' }, 
        (payload) => {
          console.log('Stock entry change detected:', payload);
          
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = payload.old.id;
            addToDeletedCache('stock_entries', deletedId);
            
            setLocalEntries(prev => prev.filter(entry => entry.id !== deletedId));
            setStockEntries(prev => prev.filter(entry => entry.id !== deletedId));
            return;
          }
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setIsLoading(true);
            
            supabase
              .from('stock_entries')
              .select(`
                *,
                stock_entry_items(*)
              `)
              .order('date', { ascending: false })
              .then(({ data, error }) => {
                setIsLoading(false);
                
                if (error) {
                  console.error("Error fetching stock entries after change:", error);
                  return;
                }
                
                if (data) {
                  console.log("Updated stock entries received:", data);
                  
                  const mappedEntries = data.map(entry => ({
                    id: entry.id,
                    supplierId: entry.supplier_id,
                    supplierName: entry.supplier_name,
                    number: entry.number,
                    invoiceNumber: entry.invoice_number,
                    notes: entry.notes,
                    date: entry.date,
                    createdAt: entry.created_at,
                    items: entry.stock_entry_items.map((item: any) => ({
                      id: item.id,
                      productId: item.product_id,
                      productName: item.product_name,
                      quantity: item.quantity,
                      purchasePrice: item.purchase_price,
                      discountPercent: item.discount_percent
                    }))
                  }));
                  
                  const filteredEntries = filterDeletedItems('stock_entries', mappedEntries);
                  
                  setLocalEntries(filteredEntries);
                  setStockEntries(filteredEntries);
                }
              });
          }
        }
      )
      .subscribe();
      
    const itemsChannel = supabase.channel('stock_entry_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_entry_items' }, 
        (payload) => {
          console.log('Stock entry item change detected:', payload);
          
          supabase
            .from('stock_entries')
            .select(`
              *,
              stock_entry_items(*)
            `)
            .order('date', { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching stock entries after item change:", error);
                return;
              }
              
              if (data) {
                console.log("Updated stock entries after item change:", data);
                
                const mappedEntries = data.map(entry => ({
                  id: entry.id,
                  supplierId: entry.supplier_id,
                  supplierName: entry.supplier_name,
                  number: entry.number,
                  invoiceNumber: entry.invoice_number,
                  notes: entry.notes,
                  date: entry.date,
                  createdAt: entry.created_at,
                  items: entry.stock_entry_items.map((item: any) => ({
                    id: item.id,
                    productId: item.product_id,
                    productName: item.product_name,
                    quantity: item.quantity,
                    purchasePrice: item.purchase_price,
                    discountPercent: item.discount_percent
                  }))
                }));
                
                const filteredEntries = filterDeletedItems('stock_entries', mappedEntries);
                
                setLocalEntries(filteredEntries);
                setStockEntries(filteredEntries);
              }
            });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(itemsChannel);
    };
  }, [setStockEntries]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleViewEntry = (id: string) => {
    navigate(`/entradas/${id}`);
  };
  
  const handleEditEntry = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/entradas/editar/${id}`);
  };
  
  const handleDeleteEntry = async (id: string) => {
    try {
      addToDeletedCache('stock_entries', id);
      
      setLocalEntries(prev => prev.filter(entry => entry.id !== id));
      
      await deleteStockEntry(id);
      
      toast.success("Entrada eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Erro ao eliminar entrada");
    }
  };
  
  const calculateEntryTotal = (entry: StockEntry) => {
    return entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Histórico de Entradas" 
          description="A carregar dados..." 
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          Carregando entradas de stock...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Entradas" 
        description="Consulte o histórico de entradas de stock"
        actions={
          <Button onClick={() => navigate('/entradas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Entrada
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
          <div className="relative w-full md:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por fornecedor, número da entrada ou fatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" onClick={toggleSortOrder} className="ml-auto flex items-center">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortOrder === 'asc' ? 'Mais antigo primeiro' : 'Mais recente primeiro'}
          </Button>
        </div>
        
        {sortedEntries.length === 0 ? (
          <EmptyState 
            title="Nenhuma entrada encontrada"
            description="Não existem entradas de stock registadas ou que correspondam à pesquisa."
            action={
              <Button onClick={() => navigate('/entradas/nova')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Entrada
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Nº Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Nº Fatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEntries.map((entry) => (
                  <tr 
                    key={entry.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewEntry(entry.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
                      {entry.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {format(new Date(entry.date), 'dd/MM/yyyy', { locale: pt })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {entry.supplierName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {entry.invoiceNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {formatCurrency(calculateEntryTotal(entry))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div onClick={(e) => e.stopPropagation()} className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleEditEntry(e, entry.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteConfirmDialog
                          title="Eliminar Entrada"
                          description="Tem a certeza que deseja eliminar esta entrada? Esta ação é irreversível e poderá afetar o stock."
                          onDelete={() => handleDeleteEntry(entry.id)}
                          trigger={
                            <Button variant="outline" size="sm">
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

export default StockEntryList;
