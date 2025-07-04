
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit, Trash2, History } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { Product } from '@/types';

interface ProductTableRowProps {
  product: Product;
  onViewProduct: (id: string) => void;
  onViewHistory: (id: string, e: React.MouseEvent) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const ProductTableRow = ({ 
  product, 
  onViewProduct, 
  onViewHistory, 
  onEdit, 
  onDelete,
  canEdit,
  canDelete
}: ProductTableRowProps) => {
  return (
    <TableRow 
      key={product.id} 
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onViewProduct(product.id)}
    >
      <TableCell className="font-medium">{product.code}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          {product.image && (
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gestorApp-gray-light">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}
          <span>{product.name}</span>
        </div>
      </TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>
        <span className={`${product.currentStock <= (product.minStock || 0) ? 'text-red-500' : ''}`}>
          {product.currentStock} unidades
        </span>
      </TableCell>
      <TableCell>{formatCurrency(product.salePrice)}</TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            title="Histórico"
            onClick={(e) => onViewHistory(product.id, e)}
          >
            <History className="w-4 h-4" />
          </Button>
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              title="Editar"
              onClick={(e) => onEdit(product.id, e)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <DeleteConfirmDialog
              title="Eliminar Produto"
              description={`Tem a certeza que deseja eliminar o produto "${product.name}"?`}
              onDelete={() => onDelete(product.id)}
              trigger={
                <Button variant="outline" size="sm" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </Button>
              }
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
