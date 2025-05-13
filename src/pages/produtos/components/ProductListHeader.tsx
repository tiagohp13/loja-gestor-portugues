
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SortField, SortDirection } from '../hooks/useProductSort';

interface ProductListHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortField: SortField;
  setSortField: (value: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (value: SortDirection) => void;
  onAddProduct: () => void;
}

const ProductListHeader = ({
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  onAddProduct
}: ProductListHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start">
      <div className="relative w-full md:w-1/2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
        <Input
          className="pl-10"
          placeholder="Pesquisar por nome ou código"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="w-full md:w-1/4">
        <Select 
          value={sortField} 
          onValueChange={(value) => setSortField(value as SortField)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="code">Código</SelectItem>
            <SelectItem value="category">Categoria</SelectItem>
            <SelectItem value="currentStock">Stock</SelectItem>
            <SelectItem value="salePrice">Preço</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
      >
        {sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />}
      </Button>

      <Button onClick={onAddProduct}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Produto
      </Button>
    </div>
  );
};

export default ProductListHeader;
