
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/formatting';
import PageHeader from '@/components/ui/PageHeader';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const StockExitNew = () => {
  const navigate = useNavigate();
  const { products, clients, addStockExit } = useData();
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [exit, setExit] = useState({
    productId: '',
    clientId: '',
    quantity: 1,
    salePrice: 0,
    productName: '',
    clientName: '',
    date: new Date()
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (productSearch.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.code.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [productSearch, products]);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setExit(prev => ({
      ...prev,
      productId: product.id,
      productName: product.name,
      salePrice: product.salePrice
    }));
    setSearchOpen(false);
    setProductSearch('');
  };

  const clearSelectedProduct = () => {
    setSelectedProduct(null);
    setExit(prev => ({
      ...prev,
      productId: '',
      productName: '',
      salePrice: 0
    }));
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
    const client = clients.find(c => c.id === value);
    setExit(prev => ({
      ...prev,
      clientId: value,
      clientName: client ? client.name : ''
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
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gestorApp-gray-dark">
                Produto
              </label>
              
              {selectedProduct ? (
                <div className="relative flex items-center h-10 px-3 py-2 border rounded-md bg-gestorApp-gray-light">
                  <span>{selectedProduct.name} (Código: {selectedProduct.code})</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 h-7 w-7"
                    onClick={clearSelectedProduct}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gestorApp-gray" />
                      <Input
                        placeholder="Pesquisar produto por nome ou código"
                        className="pl-9"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onClick={() => setSearchOpen(true)}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="max-h-72 overflow-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-gestorApp-gray-light cursor-pointer"
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gestorApp-gray">
                              Código: {product.code} | Stock: {product.currentStock} unidades
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gestorApp-gray">
                          Nenhum produto encontrado
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
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
          </div>
          
          {selectedProduct && (
            <>
              <div className="bg-blue-50 p-3 rounded-md text-blue-700">
                <span className="font-medium">Stock disponível:</span> {selectedProduct.currentStock} unidades
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
                    max={selectedProduct.currentStock}
                    value={exit.quantity}
                    onChange={handleChange}
                    required
                  />
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
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium text-gestorApp-gray-dark">
                    Data
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={exit.date instanceof Date ? exit.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setExit(prev => ({
                        ...prev,
                        date: new Date(e.target.value)
                      }));
                    }}
                    required
                  />
                </div>
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
                <Button 
                  type="submit" 
                  disabled={!selectedProduct || !exit.clientId || exit.quantity > selectedProduct.currentStock}
                >
                  Registar Saída
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default StockExitNew;
