import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useProductsQuery } from '@/hooks/queries/useProducts';
import StatusBadge from '@/components/common/StatusBadge';

interface ProductInfoModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ product, open, onOpenChange }) => {
  const { updateProduct } = useProductsQuery();
  const [hasMinStock, setHasMinStock] = useState(false);
  const [minStock, setMinStock] = useState(0);

  useEffect(() => {
    if (product) {
      setHasMinStock(product.minStock > 0);
      setMinStock(product.minStock);
    }
  }, [product]);

  if (!product) return null;

  const handleSave = async () => {
    try {
      await updateProduct({
        id: product.id,
        minStock: hasMinStock ? minStock : 0,
      });
      toast.success("Produto atualizado com sucesso");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar produto");
    }
  };

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
              <p className="text-sm font-medium text-muted-foreground">Preço de Compra</p>
              <p className="text-lg font-semibold">{formatCurrency(product.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço de Venda</p>
              <p className="text-lg font-semibold">{formatCurrency(product.salePrice)}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasMinStock"
                checked={hasMinStock}
                onCheckedChange={(checked) => setHasMinStock(checked as boolean)}
              />
              <Label 
                htmlFor="hasMinStock" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Este produto tem stock mínimo
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={!hasMinStock}
                className={!hasMinStock ? 'opacity-50 cursor-not-allowed' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {hasMinStock 
                  ? 'O produto aparecerá na lista de Stock Baixo quando o stock atual for igual ou inferior a este valor'
                  : 'Marque a opção acima para definir um stock mínimo para este produto'
                }
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Criado: {formatDateString(product.createdAt)}</p>
            {product.updatedAt && <p>Atualizado: {formatDateString(product.updatedAt)}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInfoModal;
