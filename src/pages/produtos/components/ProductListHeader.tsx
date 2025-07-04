
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { SortField, SortDirection } from '../hooks/useProductSort';

interface ProductListHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortField: SortField;
  setSortField: (value: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (value: SortDirection) => void;
  onAddProduct: () => void;
  canCreate: boolean;
}

const ProductListHeader = ({
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  onAddProduct,
  canCreate
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
      
      {canCreate && (
        <Button onClick={onAddProduct}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      )}
    </div>
  );
};

export default ProductListHeader;
