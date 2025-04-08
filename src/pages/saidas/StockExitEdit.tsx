
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { StockExitItem, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const StockExitEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, updateStockExit, products, clients } = useData();
  const [loading, setLoading] = useState(true);
  
  const [exit, setExit] = useState<Partial<StockExit>>({
    clientId: '',
    clientName: '',
    items: [] as StockExitItem[],
    date: '',
    invoiceNumber: '',
    notes: '',
    fromOrderId: undefined
  });

  useEffect(() => {
    if (id) {
      fetchExit(id);
    }
  }, [id]);

  const fetchExit = async (exitId: string) => {
    setLoading(true);
    try {
      // Primeiro tenta buscar do Supabase
      const { data: exitData, error: exitError } = await supabase
        .from('StockExits')
        .select('*')
        .eq('id', exitId)
        .single();

      if (exitError) {
        console.error('Erro ao buscar saída no Supabase:', exitError);
        
        // Se falhar, busca local
        const foundExit = stockExits.find(exit => exit.id === exitId);
        if (foundExit) {
          setExit({
            clientId: foundExit.clientId,
            clientName: foundExit.clientName,
            items: foundExit.items || [],
            date: foundExit.date ? new Date(foundExit.date).toISOString().split('T')[0] : '',
            invoiceNumber: foundExit.invoiceNumber || '',
            notes: foundExit.notes || '',
            fromOrderId: foundExit.fromOrderId,
            discount: foundExit.discount
          });
          setLoading(false);
        } else {
          toast.error('Saída não encontrada');
          navigate('/saidas/historico');
        }
        return;
      }

      if (exitData) {
        // Buscar itens da saída
        const { data: itemsData, error: itemsError } = await supabase
          .from('StockExitsItems')
          .select('*')
          .eq('exitId', exitId);

        if (itemsError) {
          console.error('Erro ao buscar itens da saída:', itemsError);
        }

        setExit({
          ...exitData,
          items: itemsData || [],
          date: exitData.date ? new Date(exitData.date).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da saída:', error);
      toast.error('Erro ao carregar detalhes da saída');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      try {
        // Get the client associated with this exit
        const client = clients.find(c => c.id === exit.clientId);
        
        if (!client) {
          toast.error('Cliente não encontrado');
          return;
        }
        
        const updateData = {
          ...exit,
          clientName: client.name,
          updatedAt: new Date().toISOString()
        };
        
        // Atualizar no Supabase
        const { error } = await supabase
          .from('StockExits')
          .update({
            clientId: updateData.clientId,
            clientName: updateData.clientName,
            date: updateData.date,
            invoiceNumber: updateData.invoiceNumber,
            notes: updateData.notes,
            updatedAt: updateData.updatedAt
          })
          .eq('id', id);

        if (error) {
          console.error('Erro ao atualizar saída no Supabase:', error);
          toast.error('Erro ao atualizar saída: ' + error.message);
          
          // Continue updating locally even if Supabase fails
          console.warn('Atualizando apenas localmente devido a erro no Supabase');
        } else {
          console.log('Saída atualizada com sucesso no Supabase');
        }
        
        // Update local state
        updateStockExit(id, updateData);
        
        toast.success('Saída atualizada com sucesso');
        navigate('/saidas/historico');
      } catch (error) {
        console.error('Erro ao atualizar saída:', error);
        toast.error('Erro ao atualizar saída');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p>Carregando detalhes da saída...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Editar Saída de Stock" 
        description="Atualize os detalhes da saída de stock" 
        actions={
          <Button variant="outline" onClick={() => navigate('/saidas/historico')}>
            Voltar ao Histórico
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="clientId" className="text-sm font-medium text-gestorApp-gray-dark">
                Cliente
              </label>
              <select
                id="clientId"
                name="clientId"
                value={exit.clientId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gestorApp-gray-dark">
                Data
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={exit.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="invoiceNumber" className="text-sm font-medium text-gestorApp-gray-dark">
              Número da Fatura
            </label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={exit.invoiceNumber}
              onChange={handleChange}
              placeholder="FAT2023XXXX"
            />
          </div>
          
          {exit.fromOrderId && (
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-blue-700 font-medium">Esta saída foi criada a partir de uma encomenda</p>
              <p className="text-sm text-blue-600 mt-1">ID da encomenda: {exit.fromOrderId}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gestorApp-gray-dark">
              Produtos (Apenas visualização, não é possível editar produtos após a criação)
            </label>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Preço Unitário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exit.items && exit.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.salePrice?.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {(item.quantity * (item.salePrice || 0)).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gestorApp-gray mt-1">
              Nota: Não é possível alterar os produtos após a criação. Se necessário, exclua esta saída e crie uma nova.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={exit.notes}
              onChange={handleChange}
              placeholder="Observações adicionais sobre a saída..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/saidas/historico')}>
              Cancelar
            </Button>
            <Button type="submit">
              Atualizar Saída
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExitEdit;
