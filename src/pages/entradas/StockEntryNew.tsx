
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

const StockEntryNew = () => {
  const navigate = useNavigate();
  const { products, suppliers, addStockEntry } = useData();
  const [productCode, setProductCode] = useState('');
  const [entry, setEntry] = useState({
    productId: '',
    supplierId: '',
    quantity: 1,
    purchasePrice: 0,
    invoiceNumber: '',
    date: new Date() // Added the date field
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setProductCode(code);
    
    // Find product by code
    const product = products.find(p => p.code === code);
    if (product) {
      setSelectedProduct(product);
      setEntry(prev => ({
        ...prev,
        productId: product.id,
        purchasePrice: product.purchasePrice
      }));
    } else {
      setSelectedProduct(null);
      setEntry(prev => ({
        ...prev,
        productId: '',
        purchasePrice: 0
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : 
              name === 'purchasePrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSupplierChange = (value: string) => {
    setEntry(prev => ({
      ...prev,
      supplierId: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.productId || !entry.supplierId) {
      alert('Por favor selecione um produto e um fornecedor');
      return;
    }
    addStockEntry(entry);
    navigate('/entradas/historico');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Registar Nova Entrada" 
        description="Adicione produtos ao stock" 
        actions={
          <Button variant="outline" onClick={() => navigate('/entradas/historico')}>
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="supplierId" className="text-sm font-medium text-gestorApp-gray-dark">
                    Fornecedor
                  </label>
                  <Select onValueChange={handleSupplierChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    placeholder="Número da fatura"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium text-gestorApp-gray-dark">
                    Quantidade
                  </label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={entry.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="purchasePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                    Preço de Compra (€)
                  </label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={entry.purchasePrice}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="bg-gestorApp-gray-light p-4 rounded-md">
                <h3 className="font-medium mb-2">Resumo da Entrada</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Produto:</div>
                  <div className="font-medium">{selectedProduct.name}</div>
                  
                  <div>Quantidade:</div>
                  <div className="font-medium">{entry.quantity} unidades</div>
                  
                  <div>Preço unitário:</div>
                  <div className="font-medium">{formatCurrency(entry.purchasePrice)}</div>
                  
                  <div>Total:</div>
                  <div className="font-medium">{formatCurrency(entry.quantity * entry.purchasePrice)}</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => navigate('/entradas/historico')}>
                  Cancelar
                </Button>
                <Button type="submit">Registar Entrada</Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default StockEntryNew;
