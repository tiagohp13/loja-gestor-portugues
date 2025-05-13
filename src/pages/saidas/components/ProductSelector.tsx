
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Product } from '@/types';

interface ProductSelectorProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isProductSearchOpen: boolean;
  setIsProductSearchOpen: (open: boolean) => void;
  filteredProducts: Product[];
  handleSearch: (value: string) => void;
  handleProductSelect: (productId: string) => void;
  selectedProductDisplay: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  searchTerm,
  setSearchTerm,
  isProductSearchOpen,
  setIsProductSearchOpen,
  filteredProducts,
  handleSearch,
  handleProductSelect,
  selectedProductDisplay
}) => {
  return (
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
  );
};

export default ProductSelector;
