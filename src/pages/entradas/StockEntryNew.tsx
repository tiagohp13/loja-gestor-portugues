
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const StockEntryNew = () => {
  const navigate = useNavigate();
  const { addStockEntry, products, suppliers } = useData();
  const [entry, setEntry] = useState({
    productId: '',
    supplierId: '',
    quantity: 1,
    purchasePrice: 0,
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'purchasePrice' 
              ? parseFloat(value) || 0 
              : value
    }));

    // If selecting a product, set the default purchase price
    if (name === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        setEntry(prev => ({
          ...prev,
          purchasePrice: selectedProduct.purchasePrice
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
    if (!entry.productId || !entry.supplierId || entry.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Get the product and supplier names
    const product = products.find(p => p.id === entry.productId);
    const supplier = suppliers.find(s => s.id === entry.supplierId);
    
    if (!product || !supplier) {
      toast.error('Produto ou fornecedor não encontrado');
      return;
    }
    
    // Add the stock entry
    addStockEntry({
      ...entry,
      productName: product.name,
      supplierName: supplier.name,
    });
    navigate('/entradas/historico');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Entrada de Stock" 
        description="Registar uma nova entrada no inventário" 
        actions={
          <Button variant="outline" onClick={() => navigate('/entradas/historico')}>
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
                value={entry.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
                required
              >
                <option value="">Selecione um produto</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name} (Stock: {product.currentStock})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
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
                value={entry.quantity}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="purchasePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço Unitário (€)
              </label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={entry.purchasePrice}
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
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/entradas/historico')}>
              Cancelar
            </Button>
            <Button type="submit">Registar Entrada</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryNew;
