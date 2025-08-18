
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { formatCurrency } from '@/utils/formatting';
import { useNavigate } from 'react-router-dom';

interface ProductSelectorProps {
  productSearchTerm: string;
  setProductSearchTerm: (term: string) => void;
  productSearchOpen: boolean;
  setProductSearchOpen: (open: boolean) => void;
  filteredProducts: any[];
  handleSelectProduct: (productId: string) => void;
  currentProduct: any;
  currentQuantity: number;
  currentSalePrice: number;
  setCurrentQuantity: (quantity: number) => void;
  setCurrentSalePrice: (price: number) => void;
  handleAddProduct: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  productSearchTerm,
  setProductSearchTerm,
  productSearchOpen,
  setProductSearchOpen,
  filteredProducts,
  handleSelectProduct,
  currentProduct,
  currentQuantity,
  currentSalePrice,
  setCurrentQuantity,
  setCurrentSalePrice,
  handleAddProduct
}) => {
  const navigate = useNavigate();
  
  return (
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
          value={currentSalePrice}
          onChange={(e) => setCurrentSalePrice(Number(e.target.value))}
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
  );
};

export default ProductSelector;
