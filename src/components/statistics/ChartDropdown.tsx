
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type ChartType = 
  | 'resumo' 
  | 'vendas' 
  | 'compras' 
  | 'lucro' 
  | 'encomendas' 
  | 'produtos' 
  | 'stockMinimo' 
  | 'clientes' 
  | 'fornecedores';

interface ChartDropdownProps {
  currentType: ChartType;
  title: string;
  onSelect: (type: ChartType) => void;
}

const ChartDropdown: React.FC<ChartDropdownProps> = ({ currentType, title, onSelect }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
        {title} <ChevronDown className="ml-1 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white z-50">
        <DropdownMenuItem onSelect={() => onSelect('resumo')}>Resumo Financeiro</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('vendas')}>Vendas</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('compras')}>Compras</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('lucro')}>Lucro</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('encomendas')}>Encomendas</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('produtos')}>Produtos com mais movimento</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('stockMinimo')}>Produtos Stock Mínimo</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('clientes')}>Clientes com mais compras</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('fornecedores')}>Fornecedores mais usados</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChartDropdown;
