
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

const StockEntryNew = () => {
  const navigate = useNavigate();
  const { products, suppliers, addStockEntry } = useData();
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [entry, setEntry] = useState({
    productId: '',
    supplierId: '',
    quantity: 1,
    purchasePrice: 0,
    productName: '',
    supplierName: ''
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
    setEntry(prev => ({
      ...prev,
      productId: product.id,
      productName: product.name,
      purchasePrice: product.purchasePrice
    }));
    setSearchOpen(false);
    setProductSearch('');
  };

  const clearSelectedProduct = () => {
    setSelectedProduct(null);
    setEntry(prev => ({
      ...prev,
      productId: '',
      productName: '',
      purchasePrice: 0
    }));
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
    const supplier = suppliers.find(s => s.id === value);
    setEntry(prev => ({
      ...prev,
      supplierId: value,
      supplierName: supplier ? supplier.name : ''
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
        description="Registe a entrada de produtos no stock" 
        actions={
          <Button variant="outline" onClick={() => navigate('/entradas/historico')}>
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
                            <div className="text-sm text-gestorApp-gray">Código: {product.code}</div>
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
          </div>
          
          {selectedProduct && (
            <>
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
            </>
          )}
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/entradas/historico')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedProduct || !entry.supplierId}>
              Registar Entrada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryNew;
