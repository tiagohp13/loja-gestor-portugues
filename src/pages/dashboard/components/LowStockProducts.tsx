
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface LowStockProductsProps {
  lowStockProducts: Product[];
  navigateToProductDetail: (id: string) => void;
}

const LowStockProducts: React.FC<LowStockProductsProps> = ({ 
  lowStockProducts,
  navigateToProductDetail
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos com Stock Baixo</CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length > 0 ? (
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <Button 
                      variant="link" 
                      className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                      onClick={() => navigateToProductDetail(product.id)}
                    >
                      {product.name}
                    </Button>
                    <div className="text-sm text-gestorApp-gray">Código: {product.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-medium">{product.currentStock} unidades</div>
                  <div className="text-sm text-gestorApp-gray">Mínimo: {product.minStock} unidades</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gestorApp-gray">
            Não existem produtos com stock baixo.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockProducts;
