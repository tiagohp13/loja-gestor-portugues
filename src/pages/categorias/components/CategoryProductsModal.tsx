import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/common/EmptyState';
import { naturalSort } from '@/pages/produtos/hooks/useProductSort';

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

type SortField = 'code' | 'name' | 'currentStock' | 'salePrice';
type SortDirection = 'asc' | 'desc';

const CategoryProductsModal: React.FC<CategoryProductsModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  categoryName
}) => {
  const { products, getCategory } = useData();
  const [category, setCategory] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    if (isOpen && categoryId) {
      const foundCategory = getCategory(categoryId);
      setCategory(foundCategory);
    }
  }, [isOpen, categoryId, getCategory]);

  const categoryProducts = products.filter(
    product => product.category === categoryName
  );

  const sortedProducts = [...categoryProducts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Use natural sort for code to handle numeric ordering
    if (sortField === 'code' && typeof aValue === 'string' && typeof bValue === 'string') {
      return naturalSort(aValue, bValue, sortDirection);
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 inline ml-1" /> 
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const getStockStatus = (product: any) => {
    if (product.currentStock === 0) {
      return <Badge variant="destructive">Sem Stock</Badge>;
    } else if (product.currentStock <= product.minStock) {
      return <Badge variant="secondary">Stock Baixo</Badge>;
    } else {
      return <Badge variant="default">Stock OK</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6" />
            {categoryName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {category?.description && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Produtos ({categoryProducts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedProducts.length === 0 ? (
                <EmptyState 
                  title="Nenhum produto nesta categoria"
                  description="Esta categoria ainda não tem produtos associados"
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('code')}
                        >
                          Código {getSortIcon('code')}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('name')}
                        >
                          Nome {getSortIcon('name')}
                        </TableHead>
                        <TableHead 
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('currentStock')}
                        >
                          Stock {getSortIcon('currentStock')}
                        </TableHead>
                        <TableHead className="text-center">
                          Estado
                        </TableHead>
                        <TableHead 
                          className="text-right cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('salePrice')}
                        >
                          Preço Venda {getSortIcon('salePrice')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedProducts.map((product) => (
                        <TableRow 
                          key={product.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            onClose();
                            window.location.href = `/produtos/${product.id}`;
                          }}
                        >
                          <TableCell className="font-medium">
                            {product.code}
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">
                            {product.currentStock}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStockStatus(product)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(product.salePrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
            <span>Total de produtos: {categoryProducts.length}</span>
            <span>
              Valor total em stock: {formatCurrency(
                categoryProducts.reduce(
                  (sum, p) => sum + (p.currentStock * p.salePrice), 
                  0
                )
              )}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryProductsModal;
