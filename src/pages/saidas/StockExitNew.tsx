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

const StockExitNew = () => {
  const navigate = useNavigate();
  const { addStockExit, products, clients } = useData();
  const [exit, setExit] = useState({
    productId: '',
    clientId: '',
    quantity: 1,
    salePrice: 0,
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExit(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePrice' 
              ? parseFloat(value) || 0 
              : value
    }));

    if (name === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        setExit(prev => ({
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
      setExit(prev => ({
        ...prev,
        productId: selectedProduct.id,
        salePrice: selectedProduct.salePrice
      }));
    }
    setIsProductSearchOpen(false);
  };
  
  const handleClientSelect = (clientId: string) => {
    setExit(prev => ({
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
    
    if (!exit.productId || !exit.clientId || exit.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const product = products.find(p => p.id === exit.productId);
    const client = clients.find(c => c.id === exit.clientId);
    
    if (!product || !client) {
      toast.error('Produto ou cliente não encontrado');
      return;
    }
    
    if (product.currentStock < exit.quantity) {
      toast.error(`Stock insuficiente. Disponível: ${product.currentStock} unidades`);
      return;
    }
    
    addStockExit({
      ...exit,
      productName: product.name,
      clientName: client.name
    });
    
    navigate('/saidas/historico');
  };

  const selectedProduct = exit.productId 
    ? products.find(p => p.id === exit.productId)
    : null;

  const totalValue = selectedProduct 
    ? exit.quantity * exit.salePrice
    : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Saída de Stock" 
        description="Registar uma nova saída do inventário" 
        actions={
          <Button variant="outline" onClick={() => navigate('/saidas/historico')}>
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
                            disabled={product.currentStock <= 0}
                            className={product.currentStock <= 0 ? "opacity-50" : ""}
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
                            {exit.productId === product.id && (
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
                          {exit.clientId === client.id && (
                            <Check className="ml-2 h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {exit.clientId && (
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
                <div className="font-medium">
                  {clients.find(c => c.id === exit.clientId)?.name || ""}
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
                value={exit.quantity}
                onChange={handleChange}
                placeholder="0"
                required
              />
              {exit.productId && (
                <p className="text-xs text-gestorApp-gray">
                  Stock disponível: {products.find(p => p.id === exit.productId)?.currentStock || 0} unidades
                </p>
              )}
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
                value={exit.salePrice}
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
                value={exit.date}
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
              value={exit.invoiceNumber}
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
            <Button variant="outline" type="button" onClick={() => navigate('/saidas/historico')}>
              Cancelar
            </Button>
            <Button type="submit">Registar Saída</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExitNew;
