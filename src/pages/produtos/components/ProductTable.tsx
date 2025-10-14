
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '@/types';
import { SortField, SortDirection } from '../hooks/useProductSort';
import ProductTableRow from './ProductTableRow';

interface ProductTableProps {
  filteredProducts: Product[];
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  onViewProduct: (id: string) => void;
  onViewHistory: (id: string, e: React.MouseEvent) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const ProductTable = ({
  filteredProducts,
  sortField,
  sortDirection,
  handleSort,
  onViewProduct,
  onViewHistory,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}: ProductTableProps) => {

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => handleSort('code')}
            >
              <div className="flex items-center">
                Código
                {getSortIcon('code')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Produto
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center">
                Categoria
                {getSortIcon('category')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('currentStock')}
            >
              <div className="flex items-center">
                Stock
                {getSortIcon('currentStock')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('salePrice')}
            >
              <div className="flex items-center">
                Preço Sugerido
                {getSortIcon('salePrice')}
              </div>
            </TableHead>
            <TableHead className="text-right pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
                Nenhum produto encontrado
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onViewProduct={onViewProduct}
                onViewHistory={onViewHistory}
                onEdit={onEdit}
                onDelete={onDelete}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
