import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, Plus, Trash, ArrowLeft, Save, Calendar } from 'lucide-react';
import { StockEntryItem } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const StockEntryNew = () => {
  const navigate = useNavigate();
  const { addStockEntry, products, suppliers } = useData();
  const [entryDetails, setEntryDetails] = useState({
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
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
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isSupplierSearchOpen, setIsSupplierSearchOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

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
      setSelectedProductDisplay(`${selectedProduct.code} - ${selectedProduct.name}`);
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
      setItems([...items, { 
        id: crypto.randomUUID(),
        ...currentItem 
      }]);
    }
    
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0
    });
    setSelectedProductDisplay('');
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    const loadingToast = toast.loading('Registando entrada...');
    
    try {
      await addStockEntry({
        supplierId: entryDetails.supplierId,
        supplierName: supplier.name,
        items: items,
        date: entryDate.toISOString(),
        invoiceNumber: entryDetails.invoiceNumber,
        notes: entryDetails.notes,
        type: 'purchase'
      });
      
      toast.dismiss(loadingToast);
      toast.success('Entrada registada com sucesso');
      navigate('/entradas/historico');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Erro ao registar entrada:", error);
      toast.error('Erro ao registar entrada');
    }
  };

  const totalValue = items.reduce((total, item) => 
    total + (item.quantity * item.purchasePrice), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold">Nova Entrada</h1>
          <p className="text-gray-500">Registar uma nova entrada no inventário</p>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/entradas/historico')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={items.length === 0 || !entryDetails.supplierId}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Guardar Entrada
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Fornecedor</label>
              <Popover open={isSupplierSearchOpen} onOpenChange={setIsSupplierSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      placeholder="Pesquisar fornecedor por nome"
                      value={supplierSearchTerm}
                      onChange={(e) => setSupplierSearchTerm(e.target.value)}
                      className="pl-10"
                      onClick={() => setIsSupplierSearchOpen(true)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[calc(100vw-2rem)] md:w-[500px]" align="start">
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
                            {supplier.name}
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

            <div>
              <label className="block text-sm font-medium mb-1">Data da Entrada</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(entryDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={entryDate}
                    onSelect={(date) => {
                      if (date) {
                        setEntryDate(date);
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium mb-4">Produtos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Produto</label>
                <Popover open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input
                        placeholder="Pesquisar produto por nome ou código"
                        value={selectedProductDisplay || searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        onClick={() => setIsProductSearchOpen(true)}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[calc(100vw-2rem)] md:w-[500px]" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Pesquisar produto..." 
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
                              <div className="flex flex-col">
                                <span className="font-medium">{product.code} - {product.name}</span>
                                <span className="text-xs text-gray-500">Stock: {product.currentStock}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <Input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Preço Compra (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentItem.purchasePrice}
                  onChange={(e) => setCurrentItem(prev => ({...prev, purchasePrice: parseFloat(e.target.value) || 0}))}
                />
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <Button 
                onClick={addItemToEntry}
                disabled={!currentItem.productId || currentItem.quantity <= 0}
                className="bg-blue-500 hover:bg-blue-600 text-white w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Nenhum produto adicionado
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.purchasePrice.toFixed(2)} €</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{(item.quantity * item.purchasePrice).toFixed(2)} €</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {totalValue.toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <Textarea
              placeholder="Observações ou notas adicionais sobre esta entrada..."
              value={entryDetails.notes}
              onChange={(e) => setEntryDetails(prev => ({...prev, notes: e.target.value}))}
              className="h-24"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryNew;
