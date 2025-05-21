
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
  // Limit to a maximum of 5 products to match with PendingOrders
  const displayProducts = lowStockProducts.slice(0, 5);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Produtos com Stock Baixo</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {displayProducts.length > 0 ? (
          <div className="space-y-4">
            {displayProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-start p-3 bg-red-50 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-gray-800 hover:text-blue-600 hover:underline transition-colors whitespace-normal text-left justify-start min-h-[24px]"
                      onClick={() => navigateToProductDetail(product.id)}
                    >
                      {product.name}
                    </Button>
                    <div className="text-sm text-gray-500">Código: {product.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-500 font-medium">{product.currentStock} unidades</div>
                  <div className="text-sm text-gray-500">Mínimo: {product.minStock} unidades</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Não existem produtos com stock baixo.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockProducts;
