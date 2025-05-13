
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
import { Client } from '@/types';

interface ClientSelectorProps {
  clientSearchTerm: string;
  setClientSearchTerm: (value: string) => void;
  isClientSearchOpen: boolean;
  setIsClientSearchOpen: (open: boolean) => void;
  filteredClients: Client[];
  handleClientSearch: (value: string) => void;
  handleClientSelect: (clientId: string) => void;
  selectedClient: Client | undefined;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  clientSearchTerm,
  setClientSearchTerm,
  isClientSearchOpen,
  setIsClientSearchOpen,
  filteredClients,
  handleClientSearch,
  handleClientSelect,
  selectedClient
}) => {
  return (
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
      {selectedClient && (
        <div className="p-3 border border-gray-300 rounded-md bg-gray-50 mt-2">
          <div className="font-medium">
            {selectedClient.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;
