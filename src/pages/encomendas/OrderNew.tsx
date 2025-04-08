import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';
import { Search, Plus, Trash2, ArrowLeft, Save, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const OrderNew = () => {
  const navigate = useNavigate();
  const { clients, products, addOrder } = useData();
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [orderItems, setOrderItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    salePrice: number;
  }>>([]);
  
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  
  const [notes, setNotes] = useState('');
  
  const filteredClients = clientSearchTerm 
    ? clients.filter(client => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        (client.taxId && client.taxId.toLowerCase().includes(clientSearchTerm.toLowerCase())))
    : clients;
  
  const filteredProducts = productSearchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(productSearchTerm.toLowerCase()))
    : products;
  
  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClientId(clientId);
    setSelectedClient(client);
    setClientSearchTerm(client ? client.name : '');
    setClientSearchOpen(false);
  };
  
  const handleSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setProductSearchTerm(`${product.code} - ${product.name}`);
    }
    setProductSearchOpen(false);
  };
  
  const handleAddProduct = () => {
    if (!currentProduct) {
      toast.error("Selecione um produto primeiro");
      return;
    }
    
    if (currentQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }
    
    const existingItemIndex = orderItems.findIndex(item => item.productId === currentProduct.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += currentQuantity;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        productId: currentProduct.id,
        productName: `${currentProduct.code} - ${currentProduct.name}`,
        quantity: currentQuantity,
        salePrice: currentProduct.salePrice
      }]);
    }
    
    setCurrentProduct(null);
    setProductSearchTerm('');
    setCurrentQuantity(1);
    
    toast.success("Produto adicionado à encomenda");
  };
  
  const handleRemoveProduct = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };
  
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.quantity * item.salePrice), 0);
  };
  
  const handleSaveOrder = async () => {
    if (!selectedClientId) {
      toast.error("Selecione um cliente para a encomenda");
      return;
    }
    
    if (orderItems.length === 0) {
      toast.error("Adicione pelo menos um produto à encomenda");
      return;
    }
    
    try {
      const newOrder = {
        clientId: selectedClientId,
        clientName: selectedClient.name,
        date: orderDate.toISOString(),
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          salePrice: item.salePrice
        })),
        notes
      };
      
      await addOrder(newOrder);
      navigate('/encomendas/consultar');
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Erro ao salvar a encomenda");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Encomenda" 
        description="Criar uma nova encomenda"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => navigate('/encomendas/consultar')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSaveOrder}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Encomenda
            </Button>
          </div>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="cliente"
                    className="pl-10"
                    placeholder="Pesquisar cliente por nome ou NIF"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[calc(100vw-2rem)] md:w-[550px]" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Pesquisar cliente..." 
                    value={clientSearchTerm}
                    onValueChange={setClientSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
                        <Button 
                          variant="link" 
                          className="mt-2 text-gestorApp-blue"
                          onClick={() => navigate('/clientes/novo')}
                        >
                          + Adicionar novo cliente
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Clientes">
                      {filteredClients.map(client => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => handleSelectClient(client.id)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{client.name}</span>
                            {client.taxId && (
                              <span className="text-xs text-gray-500">NIF: {client.taxId}</span>
                            )}
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
            <Label htmlFor="date">Data da Encomenda</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal mt-1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(orderDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={orderDate}
                  onSelect={(date) => {
                    if (date) {
                      setOrderDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Produtos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <Label htmlFor="produto">Produto</Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="produto"
                      className="pl-10"
                      placeholder="Pesquisar produto por nome ou código"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[calc(100vw-2rem)] md:w-[550px]" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Pesquisar produto..." 
                      value={productSearchTerm}
                      onValueChange={setProductSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-4 text-center">
                          <p className="text-sm text-gray-500">Nenhum produto encontrado</p>
                          <Button 
                            variant="link" 
                            className="mt-2 text-gestorApp-blue"
                            onClick={() => navigate('/produtos/novo')}
                          >
                            + Adicionar novo produto
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup heading="Produtos">
                        {filteredProducts.map(product => (
                          <CommandItem
                            key={product.id}
                            value={`${product.code} - ${product.name}`}
                            onSelect={() => handleSelectProduct(product.id)}
                          >
                            <div className="flex flex-col">
                              <div>
                                <span className="font-medium mr-2">{product.code}</span>
                                <span>{product.name}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="text-gestorApp-blue font-medium">
                                  {formatCurrency(product.salePrice)}
                                </span>
                                <span className="mx-2">|</span>
                                <span>Stock: {product.currentStock} unidades</span>
                              </div>
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
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input 
                id="quantidade"
                type="number" 
                min="1"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="salePrice">Preço Venda (€)</Label>
              <Input 
                id="salePrice"
                type="number" 
                min="0"
                step="0.01"
                value={currentProduct?.salePrice || 0}
                onChange={(e) => {
                  if (currentProduct) {
                    const updatedProduct = { ...currentProduct, salePrice: Number(e.target.value) };
                    setCurrentProduct(updatedProduct);
                  }
                }}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAddProduct}
                disabled={!currentProduct}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
          
          <div className="mt-4 border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum produto adicionado
                    </td>
                  </tr>
                ) : (
                  orderItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.salePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-blue font-medium">
                        {formatCurrency(item.quantity * item.salePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveProduct(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
                  <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
                    {formatCurrency(calculateTotal())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-6">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observações ou notas adicionais para esta encomenda"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 h-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNew;
