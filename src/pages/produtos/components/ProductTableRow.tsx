import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, History } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { Product } from "@/types";
import { checkProductDependencies } from "@/utils/dependencyUtils";

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
  canDelete,
}: ProductTableRowProps) => {
  return (
    <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onViewProduct(product.id)}>
      <TableCell className="font-medium">{product.code}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          {product.image ? (
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gestorApp-gray-light flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-md bg-gestorApp-gray-light flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-gestorApp-gray">Sem foto</span>
            </div>
          )}
          <span className="font-medium">{product.name}</span>
        </div>
      </TableCell>

      <TableCell>{product.category || "-"}</TableCell>

      <TableCell>
        <span className={`${product.currentStock <= (product.minStock || 0) ? "text-red-500" : ""}`}>
          {product.currentStock} unidades
        </span>
      </TableCell>

      <TableCell className="font-medium">{formatCurrency(product.salePrice)}</TableCell>

      {/* Coluna de ações alinhada */}
      <TableCell className="text-right w-[210px] pr-6" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center justify-end gap-2 w-full">
          {/* Botão Histórico */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 p-0"
            title="Histórico"
            onClick={(e) => onViewHistory(product.id, e)}
          >
            <History className="w-4 h-4" />
          </Button>

          {/* Botão Editar */}
          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 p-0"
              title="Editar"
              onClick={(e) => onEdit(product.id, e)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}

          {/* Botão Eliminar */}
          {canDelete && (
            <DeleteConfirmDialog
              title="Eliminar Produto"
              description={`Tem a certeza que deseja eliminar o produto "${product.name}"?`}
              onDelete={() => onDelete(product.id)}
              checkDependencies={() => checkProductDependencies(product.id)}
              trigger={
                <Button variant="outline" size="icon" className="h-9 w-9 p-0" title="Eliminar">
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
