
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/formatting';
import PageHeader from '@/components/ui/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StockExitNew = () => {
  const navigate = useNavigate();
  const { products, clients, addStockExit } = useData();
  const [productCode, setProductCode] = useState('');
  const [exit, setExit] = useState({
    productId: '',
    clientId: '',
    quantity: 1,
    salePrice: 0
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setProductCode(code);
    
    // Find product by code
    const product = products.find(p => p.code === code);
    if (product) {
      setSelectedProduct(product);
      setExit(prev => ({
        ...prev,
        productId: product.id,
        salePrice: product.salePrice
      }));
    } else {
      setSelectedProduct(null);
      setExit(prev => ({
        ...prev,
        productId: '',
        salePrice: 0
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExit(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : 
              name === 'salePrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleClientChange = (value: string) => {
    setExit(prev => ({
      ...prev,
      clientId: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exit.productId || !exit.clientId) {
      alert('Por favor selecione um produto e um cliente');
      return;
    }
    
    if (selectedProduct && exit.quantity > selectedProduct.currentStock) {
      alert(`Stock insuficiente. Stock atual: ${selectedProduct.currentStock} unidades`);
      return;
    }
    
    addStockExit(exit);
    navigate('/saidas/historico');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Registar Nova Saída" 
        description="Registe a saída de produtos do stock" 
        actions={
          <Button variant="outline" onClick={() => navigate('/saidas/historico')}>
            Ver Histórico
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="productCode" className="text-sm font-medium text-gestorApp-gray-dark">
                Código do Produto
              </label>
              <Input
                id="productCode"
                value={productCode}
                onChange={handleProductChange}
                placeholder="Digite o código do produto"
                required
              />
            </div>
            
            {selectedProduct && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gestorApp-gray-dark">
                  Produto Selecionado
                </label>
                <div className="h-10 px-3 py-2 flex items-center border rounded-md bg-gestorApp-gray-light">
                  <span>{selectedProduct.name}</span>
                </div>
              </div>
            )}
          </div>
          
          {selectedProduct && (
            <>
              <div className="bg-blue-50 p-3 rounded-md text-blue-700">
                <span className="font-medium">Stock disponível:</span> {selectedProduct.currentStock} unidades
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="clientId" className="text-sm font-medium text-gestorApp-gray-dark">
                    Cliente
                  </label>
                  <Select onValueChange={handleClientChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium text-gestorApp-gray-dark">
                    Quantidade
                  </label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.currentStock}
                    value={exit.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="salePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                  Preço de Venda (€)
                </label>
                <Input
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={exit.salePrice}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="bg-gestorApp-gray-light p-4 rounded-md">
                <h3 className="font-medium mb-2">Resumo da Saída</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Produto:</div>
                  <div className="font-medium">{selectedProduct.name}</div>
                  
                  <div>Quantidade:</div>
                  <div className="font-medium">{exit.quantity} unidades</div>
                  
                  <div>Preço unitário:</div>
                  <div className="font-medium">{formatCurrency(exit.salePrice)}</div>
                  
                  <div>Total:</div>
                  <div className="font-medium">{formatCurrency(exit.quantity * exit.salePrice)}</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => navigate('/saidas/historico')}>
                  Cancelar
                </Button>
                <Button type="submit">Registar Saída</Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default StockExitNew;
