
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';

interface ProductDetailCardProps {
  product: {
    status?: string;
    description?: string;
    category?: string;
    purchasePrice: number;
    salePrice: number;
    createdAt: string;
  };
  totalUnitsSold: number;
}

const ProductDetailCard: React.FC<ProductDetailCardProps> = ({ product, totalUnitsSold }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Detalhes do Produto</span>
          <StatusBadge status={product.status || 'active'} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Descrição</p>
            <p>{product.description || '-'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Categoria</p>
            <p>{product.category || '-'}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Preço de Compra</p>
            <p className="text-lg font-semibold">{formatCurrency(product.purchasePrice)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Preço de Venda</p>
            <p className="text-lg font-semibold">{formatCurrency(product.salePrice)}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Data de Criação</p>
            <p>{formatDateString(product.createdAt)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Unidades Vendidas</p>
            <p className="text-lg font-semibold">{totalUnitsSold}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetailCard;
