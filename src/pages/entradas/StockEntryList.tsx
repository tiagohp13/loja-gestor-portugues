
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { Search, Plus, Pencil } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatting';
import EmptyState from '@/components/common/EmptyState';
import { StockEntry } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const StockEntryList = () => {
  const navigate = useNavigate();
  const { stockEntries } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [localEntries, setLocalEntries] = useState<StockEntry[]>([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      // Buscar dados usando a função RPC
      const { data: entriesData, error: entriesError } = await supabase
        .rpc('get_stock_entries');

      if (entriesError) {
        throw entriesError;
      }

      // Transformar os dados retornados
      const entriesWithItems = await Promise.all(
        entriesData.map(async (entry) => {
          // Buscar itens para cada entrada usando a função RPC
          const { data: itemsData, error: itemsError } = await supabase
            .rpc('get_stock_entry_items', { p_entry_id: entry.id });

          if (itemsError) {
            console.error(`Erro ao buscar itens da entrada ${entry.id}:`, itemsError);
            return {
              id: entry.id,
              supplierId: entry.supplier_id,
              supplierName: entry.supplier_name,
              entryNumber: entry.entry_number,
              date: entry.date,
              invoiceNumber: entry.invoice_number,
              notes: entry.notes,
              status: (entry.status as "pending" | "completed" | "cancelled"),
              discount: entry.discount,
              createdAt: entry.created_at,
              updatedAt: entry.updated_at,
              items: []
            } as StockEntry;
          }

          // Mapear items para o formato esperado em StockEntryItem[]
          const mappedItems = itemsData.map(item => ({
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            purchasePrice: item.purchase_price
          }));

          // Retornar a entrada com seus itens mapeados
          return {
            id: entry.id,
            supplierId: entry.supplier_id,
            supplierName: entry.supplier_name,
            entryNumber: entry.entry_number,
            date: entry.date,
            invoiceNumber: entry.invoice_number,
            notes: entry.notes,
            status: (entry.status as "pending" | "completed" | "cancelled"),
            discount: entry.discount,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at,
            items: mappedItems
          } as StockEntry;
        })
      );
        
      setLocalEntries(entriesWithItems);
    } catch (err) {
      console.error('Erro ao buscar entradas:', err);
      toast.error('Erro ao carregar as entradas');
      // Fallback to local data
      setLocalEntries(stockEntries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let results = [...localEntries];
    
    if (searchTerm) {
      results = results.filter(
        entry => 
          (entry.supplierName && entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.entryNumber && entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredEntries(results);
  }, [localEntries, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Histórico de Entradas" 
        description="Consulte e gerencie entradas de stock" 
        actions={
          <Button onClick={() => navigate('/entradas/novo')}>
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
              placeholder="Pesquisar entradas..."
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
        ) : filteredEntries.length > 0 ? (
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
                    Fornecedor
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gestorApp-gray-dark">
                    Fatura
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
                {filteredEntries.map(entry => {
                  // Calculate entry total with discount
                  const subtotal = entry.items && entry.items.length > 0
                    ? entry.items.reduce(
                        (sum, item) => sum + (item.quantity * item.purchasePrice), 
                        0
                      )
                    : 0;
                  const discount = subtotal * ((entry.discount || 0) / 100);
                  const total = subtotal - discount;
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gestorApp-blue cursor-pointer" onClick={() => navigate(`/entradas/editar/${entry.id}`)}>
                        {entry.entryNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 px-4">
                        {entry.supplierName}
                      </td>
                      <td className="py-3 px-4">
                        {entry.invoiceNumber || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {entry.items ? entry.items.length : 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/entradas/editar/${entry.id}`)}
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
            title="Nenhuma entrada encontrada" 
            description="Não existem entradas de stock que correspondam à sua pesquisa."
            action={
              <Button onClick={() => navigate('/entradas/novo')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Entrada
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default StockEntryList;
