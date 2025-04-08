
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { StockExitItem } from '@/types';

const StockExitEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, updateStockExit, products, clients } = useData();
  
  const [exit, setExit] = useState({
    clientId: '',
    items: [] as StockExitItem[],
    date: '',
    invoiceNumber: '',
    notes: '',
    fromOrderId: undefined as string | undefined
  });

  useEffect(() => {
    if (id) {
      const foundExit = stockExits.find(exit => exit.id === id);
      if (foundExit) {
        setExit({
          clientId: foundExit.clientId || '',
          items: foundExit.items || [],
          date: foundExit.date ? new Date(foundExit.date).toISOString().split('T')[0] : '',
          invoiceNumber: foundExit.invoiceNumber || '',
          notes: foundExit.notes || '',
          fromOrderId: foundExit.fromOrderId
        });
      } else {
        toast.error('Saída não encontrada');
        navigate('/saidas/historico');
      }
    }
  }, [id, stockExits, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      // Get the client associated with this exit
      const client = clients.find(c => c.id === exit.clientId);
      
      if (!client) {
        toast.error('Cliente não encontrado');
        return;
      }
      
      // Update the stock exit
      updateStockExit(id, {
        ...exit,
        clientName: client.name
      });
      
      toast.success('Saída atualizada com sucesso');
      navigate('/saidas/historico');
    }
  };

  // Note: This is a simplified version. In a real app, you'd want to allow editing of individual items
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
                  {exit.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.salePrice.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {(item.quantity * item.salePrice).toFixed(2)} €
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
