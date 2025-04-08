
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const OrderConverting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, products, addStockExit } = useData();
  
  const [exit, setExit] = useState({
    productId: '',
    clientId: '',
    quantity: 1,
    salePrice: 0,
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: ''
  });
  
  const order = orders.find(o => o.id === id);
  
  useEffect(() => {
    if (!order) {
      toast.error('Encomenda não encontrada');
      navigate('/encomendas/consultar');
      return;
    }
    
    setExit({
      productId: order.productId,
      clientId: order.clientId,
      quantity: order.quantity,
      salePrice: order.salePrice,
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: ''
    });
  }, [order, navigate]);
  
  if (!order) {
    return null;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Validate form
    if (!exit.productId || !exit.clientId || exit.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Get the product
    const product = products.find(p => p.id === exit.productId);
    
    if (!product) {
      toast.error('Produto não encontrado');
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
      productName: order.productName,
      clientName: order.clientName,
    });
    
    // Navigate back to the stock exits list
    navigate('/saidas/historico');
  };
  
  // Get the selected product
  const selectedProduct = products.find(p => p.id === exit.productId);
  
  // Calculate total value
  const totalValue = selectedProduct 
    ? exit.quantity * exit.salePrice
    : 0;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Converter Encomenda em Saída" 
        description="Finalize a encomenda e crie uma saída de stock"
        actions={
          <Button variant="outline" onClick={() => navigate(`/encomendas/${id}`)}>
            Voltar à Encomenda
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gestorApp-gray-dark">
                Cliente
              </label>
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="font-medium">{order.clientName}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gestorApp-gray-dark">
                Produto
              </label>
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="font-medium">{order.productName}</div>
                <div className="text-sm text-gestorApp-gray mt-1">
                  Stock disponível: {selectedProduct?.currentStock || 0} unidades
                </div>
              </div>
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
              {selectedProduct && (
                <p className="text-xs text-gestorApp-gray">
                  Stock disponível: {selectedProduct.currentStock} unidades
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
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-lg font-semibold text-blue-800">
              Valor Total: {totalValue.toFixed(2)} €
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate(`/encomendas/${id}`)}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar Saída</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderConverting;
