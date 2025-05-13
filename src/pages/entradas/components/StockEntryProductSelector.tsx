
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Product {
  id: string;
  name: string;
  code: string;
  currentStock: number;
}

interface StockEntryProductSelectorProps {
  searchTerm: string;
  selectedProductDisplay: string;
  isProductSearchOpen: boolean;
  setSearchTerm: (value: string) => void;
  setIsProductSearchOpen: (isOpen: boolean) => void;
  handleSearch: (value: string) => void;
  filteredProducts: Product[];
  handleProductSelect: (productId: string) => void;
}

const StockEntryProductSelector: React.FC<StockEntryProductSelectorProps> = ({
  searchTerm,
  selectedProductDisplay,
  isProductSearchOpen,
  setIsProductSearchOpen,
  handleSearch,
  filteredProducts,
  handleProductSelect
}) => {
  return (
    <div>
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
  );
};

export default StockEntryProductSelector;
