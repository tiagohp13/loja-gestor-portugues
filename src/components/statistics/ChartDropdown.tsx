
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export type ChartType = 
  | 'resumo' 
  | 'vendas' 
  | 'compras' 
  | 'lucro' 
  | 'encomendas' 
  | 'stockMinimo' 
  | 'roi'
  | 'margemLucro'
  | 'taxaConversao'
  | 'valorMedioCompra'
  | 'valorMedioVenda'
  | 'lucroMedioVenda'
  | 'lucroTotal'
  | 'lucroPorCliente';

interface ChartDropdownProps {
  currentType: ChartType;
  title: string;
  onSelect: (type: ChartType) => void;
}

const ChartDropdown: React.FC<ChartDropdownProps> = ({ currentType, title, onSelect }) => {
  // Map chart types to display titles
  const getChartTitle = (type: ChartType): string => {
    const titles = {
      resumo: 'Resumo Financeiro',
      vendas: 'Vendas Mensais',
      compras: 'Compras Mensais',
      lucro: 'Lucro Mensal',
      encomendas: 'Encomendas Mensais',
      stockMinimo: 'Produtos Stock Mínimo',
      roi: 'ROI',
      margemLucro: 'Margem de Lucro',
      taxaConversao: 'Taxa de Conversão',
      valorMedioCompra: 'Valor Médio de Compra',
      valorMedioVenda: 'Valor Médio de Venda',
      lucroMedioVenda: 'Lucro Médio por Venda',
      lucroTotal: 'Lucro Total',
      lucroPorCliente: 'Lucro por Cliente'
    };
    
    return titles[type] || title;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
        {getChartTitle(currentType)} <ChevronDown className="ml-1 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white z-50">
        <DropdownMenuItem onSelect={() => onSelect('resumo')}>Resumo Financeiro</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('vendas')}>Vendas</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('compras')}>Compras</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('lucro')}>Lucro</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('encomendas')}>Encomendas</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('stockMinimo')}>Produtos Stock Mínimo</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('roi')}>ROI</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('margemLucro')}>Margem de Lucro</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('taxaConversao')}>Taxa de Conversão</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('valorMedioCompra')}>Valor Médio de Compra</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('valorMedioVenda')}>Valor Médio de Venda</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('lucroMedioVenda')}>Lucro Médio por Venda</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('lucroTotal')}>Lucro Total</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect('lucroPorCliente')}>Lucro por Cliente</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChartDropdown;
