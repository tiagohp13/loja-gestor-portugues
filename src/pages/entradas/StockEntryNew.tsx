import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isSupplierSearchOpen, setIsSupplierSearchOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'purchasePrice' 
              ? parseFloat(value) || 0 
              : value
    }));

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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSupplierSearch = (value: string) => {
    setSupplierSearchTerm(value);
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setEntry(prev => ({
        ...prev,
        productId: selectedProduct.id,
        purchasePrice: selectedProduct.purchasePrice
      }));
    }
    setIsProductSearchOpen(false);
  };
  
  const handleSupplierSelect = (supplierId: string) => {
    setEntry(prev => ({
      ...prev,
      supplierId
    }));
    setIsSupplierSearchOpen(false);
  };

  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const filteredSuppliers = supplierSearchTerm
    ? suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      )
    : suppliers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entry.productId || !entry.supplierId || entry.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const product = products.find(p => p.id === entry.productId);
    const supplier = suppliers.find(s => s.id === entry.supplierId);
    
    if (!product || !supplier) {
      toast.error('Produto ou fornecedor não encontrado');
      return;
    }
    
    addStockEntry({
      ...entry,
      productName: product.name,
      supplierName: supplier.name
    });
    
    navigate('/entradas/historico');
  };

  const selectedProduct = entry.productId 
    ? products.find(p => p.id === entry.productId)
    : null;

  const totalValue = selectedProduct 
    ? entry.quantity * entry.purchasePrice
    : 0;

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
              <Popover open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
                    <Input
                      id="productSearch"
                      className="pl-10"
                      placeholder="Pesquisar por nome ou código"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={() => setIsProductSearchOpen(true)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[calc(100vw-4rem)] max-w-lg" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Pesquisar produto por nome ou código..." 
                      value={searchTerm}
                      onValueChange={handleSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                      <CommandGroup heading="Produtos">
                        {filteredProducts.map((product) => (
                          <CommandItem 
                            key={product.id} 
                            value={`${product.code} - ${product.name}`}
                            onSelect={() => handleProductSelect(product.id)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <span className="font-medium">{product.code}</span>
                                <span className="mx-2">-</span>
                                <span>{product.name}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Stock: {product.currentStock}
                              </div>
                            </div>
                            {entry.productId === product.id && (
                              <Check className="ml-2 h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="selectedProduct" className="text-sm font-medium text-gestorApp-gray-dark">
                Produto Selecionado
              </label>
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                {selectedProduct ? (
                  <div>
                    <div className="font-medium">{selectedProduct.code} - {selectedProduct.name}</div>
                    <div className="text-sm text-gestorApp-gray mt-1">Stock disponível: {selectedProduct.currentStock} unidades</div>
                  </div>
                ) : (
                  <div className="text-gestorApp-gray italic">Nenhum produto selecionado</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="supplierSearch" className="text-sm font-medium text-gestorApp-gray-dark">
              Pesquisar Fornecedor
            </label>
            <Popover open={isSupplierSearchOpen} onOpenChange={setIsSupplierSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
                  <Input
                    id="supplierSearch"
                    className="pl-10"
                    placeholder="Pesquisar fornecedor por nome"
                    value={supplierSearchTerm}
                    onChange={(e) => setSupplierSearchTerm(e.target.value)}
                    onClick={() => setIsSupplierSearchOpen(true)}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[calc(100vw-4rem)] max-w-lg" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Pesquisar fornecedor..." 
                    value={supplierSearchTerm}
                    onValueChange={handleSupplierSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum fornecedor encontrado</CommandEmpty>
                    <CommandGroup heading="Fornecedores">
                      {filteredSuppliers.map((supplier) => (
                        <CommandItem 
                          key={supplier.id} 
                          value={supplier.name}
                          onSelect={() => handleSupplierSelect(supplier.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div>{supplier.name}</div>
                          </div>
                          {entry.supplierId === supplier.id && (
                            <Check className="ml-2 h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {entry.supplierId && (
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
                <div className="font-medium">
                  {suppliers.find(s => s.id === entry.supplierId)?.name || ""}
                </div>
              </div>
            )}
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
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-lg font-semibold text-blue-800">
              Valor Total: {totalValue.toFixed(2)} €
            </p>
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
