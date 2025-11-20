import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { Product } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';

interface ProductInfoModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ product, open, onOpenChange }) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            <StatusBadge status={product.status || 'active'} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Código</p>
              <p className="font-medium">{product.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categoria</p>
              <p className="font-medium">{product.category || '—'}</p>
            </div>
          </div>

          {product.description && (
            <div>
              <Label>Descrição</Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock Atual</p>
              <p className="text-xl font-bold">{product.currentStock}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock Mínimo</p>
              <p className="text-xl font-bold">{product.minStock}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Margem</p>
              <p className="text-lg font-semibold">
                {((((product.salePrice - product.purchasePrice) / product.salePrice) * 100) || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço de Compra</p>
              <p className="text-lg font-semibold">{formatCurrency(product.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço de Venda</p>
              <p className="text-lg font-semibold">{formatCurrency(product.salePrice)}</p>
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            <p>Criado: {formatDateString(product.createdAt)}</p>
            {product.updatedAt && <p>Atualizado: {formatDateString(product.updatedAt)}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInfoModal;
