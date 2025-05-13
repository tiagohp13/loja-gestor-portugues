
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatting';
import { Product } from '@/types';

interface FeaturedProductsProps {
  products: Product[];
  navigateToProductDetail: (id: string) => void;
  maxItems?: number;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  products, 
  navigateToProductDetail,
  maxItems = 7
}) => {
  // Sort products by value (stock * price) and get the top items
  const sortedProducts = [...products].sort((a, b) => 
    (b.currentStock * b.salePrice) - (a.currentStock * a.salePrice)
  ).slice(0, maxItems);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Produtos em Destaque</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2 text-gray-500 font-medium">Produto</th>
                <th className="text-right pb-2 text-gray-500 font-medium">Stock</th>
                <th className="text-right pb-2 text-gray-500 font-medium">Preço</th>
                <th className="text-right pb-2 text-gray-500 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3">
                    <Button 
                      variant="link" 
                      className="font-medium p-0 h-auto text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                      onClick={() => navigateToProductDetail(product.id)}
                    >
                      {product.name}
                    </Button>
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </td>
                  <td className="py-3 text-right">{product.currentStock} un.</td>
                  <td className="py-3 text-right">{formatCurrency(product.salePrice)}</td>
                  <td className="py-3 text-right font-medium text-green-600">
                    {formatCurrency(product.currentStock * product.salePrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedProducts;
