
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const StockExitEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockExits, updateStockExit, products, clients } = useData();
  
  const [exit, setExit] = useState({
    productId: '',
    clientId: '',
    quantity: 0,
    salePrice: 0,
    date: ''
  });

  useEffect(() => {
    if (id) {
      const foundExit = stockExits.find(exit => exit.id === id);
      if (foundExit) {
        setExit({
          productId: foundExit.productId || '',
          clientId: foundExit.clientId || '',
          quantity: foundExit.quantity || 0,
          salePrice: foundExit.salePrice || 0,
          date: foundExit.date ? new Date(foundExit.date).toISOString().split('T')[0] : ''
        });
      } else {
        toast.error('Saída não encontrada');
        navigate('/saidas/historico');
      }
    }
  }, [id, stockExits, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExit(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePrice' 
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      // Get the product and client associated with this exit
      const product = products.find(p => p.id === exit.productId);
      const client = clients.find(c => c.id === exit.clientId);
      
      if (!product || !client) {
        toast.error('Produto ou cliente não encontrado');
        return;
      }
      
      // Update the stock exit
      updateStockExit(id, {
        ...exit,
        productName: product.name,
        clientName: client.name
      });
      
      toast.success('Saída atualizada com sucesso');
      navigate('/saidas/historico');
    }
  };

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
              <label htmlFor="productId" className="text-sm font-medium text-gestorApp-gray-dark">
                Produto
              </label>
              <select
                id="productId"
                name="productId"
                value={exit.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
                disabled
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gestorApp-gray">O produto não pode ser alterado após a criação</p>
            </div>
            
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
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium text-gestorApp-gray-dark">
                Quantidade
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={exit.quantity}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="salePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço Unitário (€)
              </label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                min="0"
                value={exit.salePrice}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
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
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/saidas/historico')}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExitEdit;
