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
import { StockExit } from '@/types';
import { supabase, addToDeletedCache, filterDeletedItems } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StatusBadge from '@/components/common/StatusBadge';

const StockExitList = () => {
  const navigate = useNavigate();
  const { stockExits, deleteStockExit, setStockExits } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [localExits, setLocalExits] = useState<StockExit[]>([]);
  
  const filteredExits = localExits.filter(exit => 
    exit.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exit.invoiceNumber && exit.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const sortedExits = [...filteredExits].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  const fetchAllExits = async () => {
    try {
      console.log("Fetching stock exits...");
      
      const { data, error } = await supabase
        .from('stock_exits')
        .select(`
          *,
          stock_exit_items(*)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching stock exits:", error);
        toast.error("Erro ao carregar saídas de stock");
        return;
      }

      if (data) {
        console.log("Stock exits data received:", data);
        
        const mappedExits = data.map(exit => ({
          id: exit.id,
          clientId: exit.client_id,
          clientName: exit.client_name,
          number: exit.number,
          invoiceNumber: exit.invoice_number,
          notes: exit.notes,
          date: exit.date,
          createdAt: exit.created_at,
          fromOrderId: exit.from_order_id,
          fromOrderNumber: exit.from_order_number,
          discount: exit.discount,
          items: exit.stock_exit_items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            salePrice: item.sale_price,
            discountPercent: item.discount_percent
          }))
        }));
        
        const filteredExits = filterDeletedItems('stock_exits', mappedExits);
        
        setLocalExits(filteredExits);
        setStockExits(filteredExits);
        console.log("Updated local exits:", filteredExits.length);
      }
    } catch (error) {
      console.error("Error in fetchExits:", error);
      toast.error("Erro ao carregar saídas de stock");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    setIsLoading(true);
    fetchAllExits();
  }, [setStockExits]);

  // Setup realtime subscriptions
  useEffect(() => {
    console.log("Setting up realtime subscriptions for stock exits");
    
    // Create a dedicated channel for stock_exits changes
    const channel = supabase.channel('stock_exits_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_exits' }, 
        (payload) => {
          console.log('Stock exit change detected:', payload);
          fetchAllExits();
        }
      )
      .subscribe((status) => {
        console.log('Stock exits subscription status:', status);
      });
      
    // Create a dedicated channel for stock_exit_items changes  
    const itemsChannel = supabase.channel('stock_exit_items_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_exit_items' }, 
        (payload) => {
          console.log('Stock exit item change detected:', payload);
          fetchAllExits();
        }
      )
      .subscribe((status) => {
        console.log('Stock exit items subscription status:', status);
      });
    
    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(channel);
      supabase.removeChannel(itemsChannel);
    };
  }, []);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleViewExit = (id: string) => {
    navigate(`/saidas/${id}`);
  };
  
  const handleEditExit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/saidas/editar/${id}`);
  };
  
  const handleDeleteExit = async (id: string) => {
    try {
      addToDeletedCache('stock_exits', id);
      
      setLocalExits(prev => prev.filter(exit => exit.id !== id));
      
      await deleteStockExit(id);
      
      toast.success("Saída eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting exit:", error);
      toast.error("Erro ao eliminar saída");
    }
  };
  
  const calculateExitTotal = (exit: StockExit) => {
    return exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Histórico de Saídas" 
          description="A carregar dados..." 
        />
        <div className="bg-white rounded-lg shadow p-6 mt-6 text-center">
          Carregando saídas de stock...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Saídas" 
        description="Consulte o histórico de saídas de stock"
        actions={
          <Button onClick={() => navigate('/saidas/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Saída
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
          <div className="relative w-full md:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por cliente, número da saída ou fatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" onClick={toggleSortOrder} className="ml-auto flex items-center">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortOrder === 'asc' ? 'Mais antigo primeiro' : 'Mais recente primeiro'}
          </Button>
        </div>
        
        {sortedExits.length === 0 ? (
          <EmptyState 
            title="Nenhuma saída encontrada"
            description="Não existem saídas de stock registadas ou que correspondam à pesquisa."
            action={
              <Button onClick={() => navigate('/saidas/nova')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Saída
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Nº Saída
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                    Cliente
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
                {sortedExits.map((exit) => (
                  <tr 
                    key={exit.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewExit(exit.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
                      {exit.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {format(new Date(exit.date), 'dd/MM/yyyy', { locale: pt })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {exit.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {exit.invoiceNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                      {formatCurrency(calculateExitTotal(exit))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div onClick={(e) => e.stopPropagation()} className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleEditExit(e, exit.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteConfirmDialog
                          title="Eliminar Saída"
                          description="Tem a certeza que deseja eliminar esta saída? Esta ação é irreversível e poderá afetar o stock."
                          onDelete={() => handleDeleteExit(exit.id)}
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

export default StockExitList;
