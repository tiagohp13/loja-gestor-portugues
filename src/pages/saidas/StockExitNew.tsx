
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
import { Search, Check, Plus, Trash, ArrowLeft, Save, Calendar } from 'lucide-react';
import { StockExitItem } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const StockExitNew = () => {
  const navigate = useNavigate();
  const { addStockExit, products, clients } = useData();
  const [exitDetails, setExitDetails] = useState({
    clientId: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });
  
  const [items, setItems] = useState<StockExitItem[]>([]);
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    salePrice: number;
    discountPercent: number;
  }>({
    productId: '',
    productName: '',
    quantity: 1,
    salePrice: 0,
    discountPercent: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [exitDate, setExitDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleExitDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExitDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePrice' || name === 'discountPercent'
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value);
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setCurrentItem({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        salePrice: selectedProduct.salePrice,
        discountPercent: 0
      });
    }
    setIsProductSearchOpen(false);
  };
  
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setExitDetails(prev => ({
      ...prev,
      clientId,
      clientName: selectedClient?.name || ''
    }));
    setIsClientSearchOpen(false);
  };
  
  const addItemToExit = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Selecione um produto e uma quantidade válida');
      return;
    }
    
    const product = products.find(p => p.id === currentItem.productId);
    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }
    
    const existingItem = items.find(item => item.productId === currentItem.productId);
    const totalNeededQuantity = existingItem 
      ? existingItem.quantity + currentItem.quantity 
      : currentItem.quantity;
    
    if (product.currentStock < totalNeededQuantity) {
      toast.error(`Stock insuficiente. Disponível: ${product.currentStock} unidades`);
      return;
    }
    
    const existingItemIndex = items.findIndex(item => item.productId === currentItem.productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + currentItem.quantity,
        salePrice: currentItem.salePrice,
        discountPercent: currentItem.discountPercent
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
      salePrice: 0,
      discountPercent: 0
    });
    setSearchTerm('');
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const filteredProducts = searchTerm
    ? products.filter(product => 
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
        product.currentStock > 0
      )
    : products.filter(product => product.currentStock > 0);

  const filteredClients = clientSearchTerm
    ? clients.filter(client => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
      )
    : clients;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exitDetails.clientId || items.length === 0) {
      toast.error('Selecione um cliente e adicione pelo menos um produto');
      return;
    }
    
    const client = clients.find(c => c.id === exitDetails.clientId);
    
    if (!client) {
      toast.error('Cliente não encontrado');
      return;
    }
    
    let hasEnoughStock = true;
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.currentStock < item.quantity) {
        hasEnoughStock = false;
        toast.error(`Stock insuficiente para ${item.productName}. Disponível: ${product?.currentStock || 0} unidades`);
      }
    });
    
    if (!hasEnoughStock) return;
    
    const loadingToast = toast.loading('Registando saída...');
    
    try {
      await addStockExit({
        clientId: exitDetails.clientId,
        clientName: client.name,
        items: items,
        date: exitDate.toISOString(),
        invoiceNumber: exitDetails.invoiceNumber,
        notes: exitDetails.notes
      });
      
      toast.dismiss(loadingToast);
      toast.success('Saída registada com sucesso');
      navigate('/saidas/historico');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Erro ao registar saída:", error);
      toast.error('Erro ao registar saída');
    }
  };

  const getDiscountedPrice = (price: number, discountPercent: number) => {
    if (!discountPercent) return price;
    return price * (1 - discountPercent / 100);
  };

  const totalValue = items.reduce((total, item) => 
    total + (item.quantity * getDiscountedPrice(item.salePrice, item.discountPercent || 0)), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold">Nova Saída</h1>
          <p className="text-gray-500">Registar uma nova saída de stock</p>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/saidas/historico')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={items.length === 0 || !exitDetails.clientId}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Guardar Saída
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <Popover open={isClientSearchOpen} onOpenChange={setIsClientSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      placeholder="Pesquisar cliente por nome ou NIF"
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="pl-10"
                      onClick={() => setIsClientSearchOpen(true)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[calc(100vw-2rem)] md:w-[500px]" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Pesquisar cliente..." 
                      value={clientSearchTerm}
                      onValueChange={handleClientSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                      <CommandGroup heading="Clientes">
                        {filteredClients.map((client) => (
                          <CommandItem 
                            key={client.id} 
                            value={client.name}
                            onSelect={() => handleClientSelect(client.id)}
                          >
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {exitDetails.clientId && (
                <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
                  <div className="font-medium">
                    {clients.find(c => c.id === exitDetails.clientId)?.name || ""}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data da Saída</label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(exitDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={exitDate}
                    onSelect={(date) => {
                      if (date) {
                        setExitDate(date);
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Produto</label>
                <Popover open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input
                        placeholder="Pesquisar produto por nome ou código"
                        value={searchTerm}
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
                        <CommandEmpty>Nenhum produto encontrado com stock disponível</CommandEmpty>
                        <CommandGroup heading="Produtos">
                          {filteredProducts.map((product) => (
                            <CommandItem 
                              key={product.id} 
                              value={`${product.code} - ${product.name}`}
                              onSelect={() => handleProductSelect(product.id)}
                              disabled={product.currentStock <= 0}
                              className={product.currentStock <= 0 ? "opacity-50" : ""}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{product.code} - {product.name}</span>
                                <span className="text-xs text-gray-500">Stock disponível: {product.currentStock}</span>
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
                  max={products.find(p => p.id === currentItem.productId)?.currentStock || 0}
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem(prev => ({...prev, quantity: parseInt(e.target.value) || 1}))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Preço Venda (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentItem.salePrice}
                  onChange={(e) => setCurrentItem(prev => ({...prev, salePrice: parseFloat(e.target.value) || 0}))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Desconto (%)</label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={currentItem.discountPercent}
                  onChange={(e) => setCurrentItem(prev => ({...prev, discountPercent: parseFloat(e.target.value) || 0}))}
                />
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <Button 
                onClick={addItemToExit}
                disabled={
                  !currentItem.productId || 
                  currentItem.quantity <= 0 || 
                  (products.find(p => p.id === currentItem.productId)?.currentStock || 0) < currentItem.quantity
                }
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhum produto adicionado
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const discountedPrice = getDiscountedPrice(item.salePrice, item.discountPercent || 0);
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.salePrice.toFixed(2)} €</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.discountPercent ? `${item.discountPercent}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{(item.quantity * discountedPrice).toFixed(2)} €</td>
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
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
              placeholder="Observações ou notas adicionais sobre esta saída..."
              value={exitDetails.notes}
              onChange={(e) => setExitDetails(prev => ({...prev, notes: e.target.value}))}
              className="h-24"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExitNew;
