
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const StockExitNew = () => {
  const navigate = useNavigate();
  const { addStockExit, products, clients } = useData();
  const [exit, setExit] = useState({
    productId: '',
    clientId: '',
    quantity: 1,
    salePrice: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExit(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePrice' 
              ? parseFloat(value) || 0 
              : value
    }));

    // If selecting a product, set the default sale price
    if (name === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        setExit(prev => ({
          ...prev,
          salePrice: selectedProduct.salePrice
        }));
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!exit.productId || !exit.clientId || exit.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Get the product and client
    const product = products.find(p => p.id === exit.productId);
    const client = clients.find(c => c.id === exit.clientId);
    
    if (!product || !client) {
      toast.error('Produto ou cliente não encontrado');
      return;
    }
    
    // Check if we have enough stock
    if (product.currentStock < exit.quantity) {
      toast.error(`Stock insuficiente. Disponível: ${product.currentStock} unidades`);
      return;
    }
    
    // Add the stock exit
    addStockExit({
      ...exit,
      productName: product.name,
      clientName: client.name,
    });
    
    navigate('/saidas/historico');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Saída de Stock" 
        description="Registar uma nova saída do inventário" 
        actions={
          <Button variant="outline" onClick={() => navigate('/saidas/historico')}>
            Voltar ao Histórico
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="productSearch" className="text-sm font-medium text-gestorApp-gray-dark">
                Pesquisar Produto
              </label>
              <Input
                id="productSearch"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Pesquisar por nome ou código"
              />
            </div>
            
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
                required
              >
                <option value="">Selecione um produto</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id} disabled={product.currentStock <= 0}>
                    {product.code} - {product.name} (Stock: {product.currentStock})
                  </option>
                ))}
              </select>
            </div>
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
              {exit.productId && (
                <p className="text-xs text-gestorApp-gray">
                  Stock disponível: {products.find(p => p.id === exit.productId)?.currentStock || 0} unidades
                </p>
              )}
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
            <Button type="submit">Registar Saída</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExitNew;
