
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
import { Check, Search, Plus, Trash, Package } from 'lucide-react';
import { StockEntryItem } from '@/types';

const StockEntryNew = () => {
  const navigate = useNavigate();
  const { addStockEntry, products, suppliers } = useData();
  const [entryDetails, setEntryDetails] = useState({
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: '',
    discount: 0
  });
  
  const [items, setItems] = useState<StockEntryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
  }>({
    productId: '',
    productName: '',
    quantity: 1,
    purchasePrice: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isSupplierSearchOpen, setIsSupplierSearchOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');

  const handleEntryDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'purchasePrice' 
              ? parseFloat(value) || 0 
              : value
    }));
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
      setCurrentItem({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        purchasePrice: selectedProduct.purchasePrice
      });
    }
    setIsProductSearchOpen(false);
  };
  
  const handleSupplierSelect = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    setEntryDetails(prev => ({
      ...prev,
      supplierId,
      supplierName: selectedSupplier?.name || ''
    }));
    setIsSupplierSearchOpen(false);
  };
  
  const addItemToEntry = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Selecione um produto e uma quantidade válida');
      return;
    }
    
    const existingItemIndex = items.findIndex(item => item.productId === currentItem.productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + currentItem.quantity,
        purchasePrice: currentItem.purchasePrice
      };
      setItems(updatedItems);
    } else {
      setItems([...items, { ...currentItem }]);
    }
    
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0
    });
    setSearchTerm('');
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
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
    
    if (!entryDetails.supplierId || items.length === 0) {
      toast.error('Selecione um fornecedor e adicione pelo menos um produto');
      return;
    }
    
    const supplier = suppliers.find(s => s.id === entryDetails.supplierId);
    
    if (!supplier) {
      toast.error('Fornecedor não encontrado');
      return;
    }
    
    addStockEntry({
      supplierId: entryDetails.supplierId,
      supplierName: supplier.name,
      items: items,
      date: entryDetails.date,
      invoiceNumber: entryDetails.invoiceNumber,
      notes: entryDetails.notes,
      // Add discount as a recognized property
      discount: parseFloat(entryDetails.discount.toString()) || 0
    });
    
    navigate('/entradas/historico');
  };

  const subtotal = items.reduce((total, item) => 
    total + (item.quantity * item.purchasePrice), 0);
  const discountAmount = subtotal * (entryDetails.discount / 100);
  const totalValue = subtotal - discountAmount;

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
                            {entryDetails.supplierId === supplier.id && (
                              <Check className="ml-2 h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {entryDetails.supplierId && (
                <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
                  <div className="font-medium">
                    {suppliers.find(s => s.id === entryDetails.supplierId)?.name || ""}
                  </div>
                </div>
              )}
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
                  value={entryDetails.date}
                  onChange={handleEntryDetailsChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="invoiceNumber" className="text-sm font-medium text-gestorApp-gray-dark">
                  Número da Fatura
                </label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={entryDetails.invoiceNumber}
                  onChange={handleEntryDetailsChange}
                  placeholder="FAT2023XXXX"
                />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-medium mb-4 flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Adicionar Produtos
              </h3>
              
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
                                {currentItem.productId === product.id && (
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
                
                {currentItem.productId && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                      <div className="font-medium">{products.find(p => p.id === currentItem.productId)?.name || ""}</div>
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
                        value={currentItem.quantity}
                        onChange={handleItemChange}
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
                        value={currentItem.purchasePrice}
                        onChange={handleItemChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                )}
                
                {currentItem.productId && (
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={addItemToEntry}
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Produto
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {items.length > 0 && (
              <div className="border rounded-md mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.purchasePrice.toFixed(2)} €</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{(item.quantity * item.purchasePrice).toFixed(2)} €</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={entryDetails.notes}
              onChange={handleEntryDetailsChange}
              placeholder="Observações adicionais sobre a entrada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="discount" className="text-sm font-medium text-gestorApp-gray-dark">
              Desconto (%)
            </label>
            <Input
              id="discount"
              name="discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={entryDetails.discount}
              onChange={handleEntryDetailsChange}
              placeholder="0.00"
            />
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <dl className="grid md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-blue-800">Subtotal:</dt>
                <dd className="text-lg font-semibold text-blue-800">{subtotal.toFixed(2)} €</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-blue-800">Desconto ({entryDetails.discount}%):</dt>
                <dd className="text-lg font-semibold text-blue-800">{discountAmount.toFixed(2)} €</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-blue-800">Total:</dt>
                <dd className="text-lg font-semibold text-blue-800">{totalValue.toFixed(2)} €</dd>
              </div>
            </dl>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/entradas/historico')}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={items.length === 0 || !entryDetails.supplierId}
            >
              Registar Entrada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryNew;
