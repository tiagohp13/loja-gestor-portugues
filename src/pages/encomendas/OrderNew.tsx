
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
import { Search, Check } from 'lucide-react';

const OrderNew = () => {
  const navigate = useNavigate();
  const { addOrder, products, clients } = useData();
  const [order, setOrder] = useState({
    productId: '',
    clientId: '',
    quantity: 1,
    salePrice: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrder(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePrice' 
              ? parseFloat(value) || 0 
              : value
    }));

    // If selecting a product, set the default sale price
    if (name === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        setOrder(prev => ({
          ...prev,
          salePrice: selectedProduct.salePrice
        }));
      }
    }
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
      setOrder(prev => ({
        ...prev,
        productId: selectedProduct.id,
        salePrice: selectedProduct.salePrice
      }));
    }
    setIsProductSearchOpen(false);
  };
  
  const handleClientSelect = (clientId: string) => {
    setOrder(prev => ({
      ...prev,
      clientId
    }));
    setIsClientSearchOpen(false);
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
    if (!order.productId || !order.clientId || order.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Get the product and client
    const product = products.find(p => p.id === order.productId);
    const client = clients.find(c => c.id === order.clientId);
    
    if (!product || !client) {
      toast.error('Produto ou cliente não encontrado');
      return;
    }
    
    // Add the order
    addOrder({
      ...order,
      productName: product.name,
      clientName: client.name,
    });
    
    navigate('/encomendas/consultar');
  };

  // Get the selected product
  const selectedProduct = order.productId 
    ? products.find(p => p.id === order.productId)
    : null;

  // Calculate total value
  const totalValue = selectedProduct 
    ? order.quantity * order.salePrice
    : 0;

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
                            </div>
                            {order.productId === product.id && (
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
                  </div>
                ) : (
                  <div className="text-gestorApp-gray italic">Nenhum produto selecionado</div>
                )}
              </div>
            </div>
          </div>
          
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
                          {order.clientId === client.id && (
                            <Check className="ml-2 h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {order.clientId && (
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
                <div className="font-medium">
                  {clients.find(c => c.id === order.clientId)?.name || ""}
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
                value={order.quantity}
                onChange={handleChange}
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
                value={order.salePrice}
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
                value={order.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={order.notes}
              onChange={handleChange}
              placeholder="Observações adicionais sobre a encomenda..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
              rows={3}
            />
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-lg font-semibold text-blue-800">
              Valor Total: {totalValue.toFixed(2)} €
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/encomendas/consultar')}>
              Cancelar
            </Button>
            <Button type="submit">Registar Encomenda</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderNew;
