
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
import { Search, Check, Plus, Trash, ShoppingCart } from 'lucide-react';
import { OrderItem } from '@/types';

const OrderNew = () => {
  const navigate = useNavigate();
  const { addOrder, products, clients } = useData();
  const [orderDetails, setOrderDetails] = useState({
    clientId: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    salePrice: number;
  }>({
    productId: '',
    productName: '',
    quantity: 1,
    salePrice: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);

  const handleOrderDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePrice' 
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleProductSearch = (value: string) => {
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
        salePrice: selectedProduct.salePrice
      });
    }
    setIsProductSearchOpen(false);
  };
  
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setOrderDetails(prev => ({
      ...prev,
      clientId,
      clientName: selectedClient?.name || ''
    }));
    setIsClientSearchOpen(false);
  };
  
  const addItemToOrder = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Selecione um produto e uma quantidade válida');
      return;
    }
    
    // Check if the product is already in the order
    const existingItemIndex = items.findIndex(item => item.productId === currentItem.productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + currentItem.quantity,
        salePrice: currentItem.salePrice // Update the price in case it changed
      };
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, { ...currentItem }]);
    }
    
    // Reset current item
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      salePrice: 0
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

  const filteredClients = clientSearchTerm
    ? clients.filter(client => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
      )
    : clients;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!orderDetails.clientId || items.length === 0) {
      toast.error('Selecione um cliente e adicione pelo menos um produto');
      return;
    }
    
    // Get the client
    const client = clients.find(c => c.id === orderDetails.clientId);
    
    if (!client) {
      toast.error('Cliente não encontrado');
      return;
    }
    
    // Add the order
    addOrder({
      clientId: orderDetails.clientId,
      clientName: client.name,
      items: items,
      date: orderDetails.date,
      notes: orderDetails.notes
    });
    
    navigate('/encomendas/consultar');
  };

  // Calculate total value
  const totalValue = items.reduce((total, item) => 
    total + (item.quantity * item.salePrice), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Encomenda" 
        description="Registar uma nova encomenda de cliente" 
        actions={
          <Button variant="outline" onClick={() => navigate('/encomendas/consultar')}>
            Voltar à Lista
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="clientSearch" className="text-sm font-medium text-gestorApp-gray-dark">
                Pesquisar Cliente
              </label>
              <Popover open={isClientSearchOpen} onOpenChange={setIsClientSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
                    <Input
                      id="clientSearch"
                      className="pl-10"
                      placeholder="Pesquisar cliente por nome"
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      onClick={() => setIsClientSearchOpen(true)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[calc(100vw-4rem)] max-w-lg" align="start">
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
                            <div className="flex items-center justify-between w-full">
                              <div>{client.name}</div>
                            </div>
                            {orderDetails.clientId === client.id && (
                              <Check className="ml-2 h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {orderDetails.clientId && (
                <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
                  <div className="font-medium">
                    {clients.find(c => c.id === orderDetails.clientId)?.name || ""}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gestorApp-gray-dark">
                Data
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={orderDetails.date}
                onChange={handleOrderDetailsChange}
                required
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-medium mb-4 flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
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
                          onValueChange={handleProductSearch}
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
                      <label htmlFor="salePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                        Preço Unitário (€)
                      </label>
                      <Input
                        id="salePrice"
                        name="salePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentItem.salePrice}
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
                      onClick={addItemToOrder}
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Produto
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Products list */}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{item.salePrice.toFixed(2)} €</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{(item.quantity * item.salePrice).toFixed(2)} €</td>
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
              value={orderDetails.notes}
              onChange={handleOrderDetailsChange}
              placeholder="Observações adicionais sobre a encomenda..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
              rows={3}
            />
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-lg font-semibold text-blue-800">
              Valor Total: {totalValue.toFixed(2)} €
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Total de itens: {items.length}
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/encomendas/consultar')}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={items.length === 0 || !orderDetails.clientId}
            >
              Registar Encomenda
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderNew;
