import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
interface ClientSelectorProps {
  clientSearchTerm: string;
  setClientSearchTerm: (term: string) => void;
  clientSearchOpen: boolean;
  setClientSearchOpen: (open: boolean) => void;
  filteredClients: any[];
  handleSelectClient: (clientId: string) => void;
}
const ClientSelector: React.FC<ClientSelectorProps> = ({
  clientSearchTerm,
  setClientSearchTerm,
  clientSearchOpen,
  setClientSearchOpen,
  filteredClients,
  handleSelectClient
}) => {
  const navigate = useNavigate();
  return <div>
      
      <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input id="cliente" className="pl-10" placeholder="Pesquisar cliente por nome ou NIF" value={clientSearchTerm} onChange={e => setClientSearchTerm(e.target.value)} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[calc(100vw-2rem)] md:w-[550px]" align="start">
          <Command>
            <CommandInput placeholder="Pesquisar cliente..." value={clientSearchTerm} onValueChange={setClientSearchTerm} />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
                  <Button variant="link" className="mt-2 text-gestorApp-blue" onClick={() => navigate('/clientes/novo')}>
                    + Adicionar novo cliente
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup heading="Clientes">
                {filteredClients.map(client => <CommandItem key={client.id} value={client.name} onSelect={() => handleSelectClient(client.id)}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      {client.taxId && <span className="text-xs text-gray-500">NIF: {client.taxId}</span>}
                    </div>
                  </CommandItem>)}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>;
};
export default ClientSelector;