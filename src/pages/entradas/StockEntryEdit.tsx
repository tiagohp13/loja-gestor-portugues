
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { StockEntryItem } from '@/types';

const StockEntryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries, updateStockEntry, products, suppliers } = useData();
  
  const [entry, setEntry] = useState({
    supplierId: '',
    items: [] as StockEntryItem[],
    date: '',
    invoiceNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      const foundEntry = stockEntries.find(entry => entry.id === id);
      if (foundEntry) {
        setEntry({
          supplierId: foundEntry.supplierId || '',
          items: foundEntry.items || [],
          date: foundEntry.date ? new Date(foundEntry.date).toISOString().split('T')[0] : '',
          invoiceNumber: foundEntry.invoiceNumber || '',
          notes: foundEntry.notes || ''
        });
      } else {
        toast.error('Entrada não encontrada');
        navigate('/entradas/historico');
      }
    }
  }, [id, stockEntries, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      // Get the supplier associated with this entry
      const supplier = suppliers.find(s => s.id === entry.supplierId);
      
      if (!supplier) {
        toast.error('Fornecedor não encontrado');
        return;
      }
      
      // Update the stock entry
      updateStockEntry(id, {
        ...entry,
        supplierName: supplier.name
      });
      
      toast.success('Entrada atualizada com sucesso');
      navigate('/entradas/historico');
    }
  };

  // Note: This is a simplified version. In a real app, you'd want to allow editing of individual items
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Editar Entrada de Stock" 
        description="Atualize os detalhes da entrada de stock" 
        actions={
          <Button variant="outline" onClick={() => navigate('/entradas/historico')}>
            Voltar ao Histórico
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="supplierId" className="text-sm font-medium text-gestorApp-gray-dark">
                Fornecedor
              </label>
              <select
                id="supplierId"
                name="supplierId"
                value={entry.supplierId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
                value={entry.date}
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
              value={entry.invoiceNumber}
              onChange={handleChange}
              placeholder="FAT2023XXXX"
            />
          </div>
          
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
                  {entry.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {item.purchasePrice.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
                        {(item.quantity * item.purchasePrice).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gestorApp-gray mt-1">
              Nota: Não é possível alterar os produtos após a criação. Se necessário, exclua esta entrada e crie uma nova.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={entry.notes}
              onChange={handleChange}
              placeholder="Observações adicionais sobre a entrada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/entradas/historico')}>
              Cancelar
            </Button>
            <Button type="submit">
              Atualizar Entrada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryEdit;
