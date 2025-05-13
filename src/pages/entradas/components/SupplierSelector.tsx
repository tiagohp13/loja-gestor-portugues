
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

interface SupplierSelectorProps {
  supplierSearchTerm: string;
  isSupplierSearchOpen: boolean;
  setIsSupplierSearchOpen: (isOpen: boolean) => void;
  handleSupplierSearch: (value: string) => void;
  filteredSuppliers: Array<{ id: string; name: string }>;
  handleSupplierSelect: (supplierId: string) => void;
  selectedSupplier?: { id: string; name: string } | undefined;
}

const SupplierSelector: React.FC<SupplierSelectorProps> = ({
  supplierSearchTerm,
  isSupplierSearchOpen,
  setIsSupplierSearchOpen,
  handleSupplierSearch,
  filteredSuppliers,
  handleSupplierSelect,
  selectedSupplier
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Fornecedor</label>
      <Popover open={isSupplierSearchOpen} onOpenChange={setIsSupplierSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              placeholder="Pesquisar fornecedor por nome"
              value={supplierSearchTerm}
              onChange={(e) => handleSupplierSearch(e.target.value)}
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
      {selectedSupplier && (
        <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
          <div className="font-medium">
            {selectedSupplier.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSelector;
