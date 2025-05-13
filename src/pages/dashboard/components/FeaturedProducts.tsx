
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatting';
import { Product } from '@/types';

interface FeaturedProductsProps {
  products: Product[];
  navigateToProductDetail: (id: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, navigateToProductDetail }) => {
  // Sort products by value (stock * price) and get the top items
  // Previously only taking top 5, now taking up to 10 for better space utilization
  const sortedProducts = [...products].sort((a, b) => 
    (b.currentStock * b.salePrice) - (a.currentStock * a.salePrice)
  ).slice(0, 10);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Produtos em Destaque</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] flex flex-col">
        <div className="overflow-auto flex-grow">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b">
                <th className="text-left pb-2 text-gestorApp-gray font-medium">Produto</th>
                <th className="text-right pb-2 text-gestorApp-gray font-medium">Stock</th>
                <th className="text-right pb-2 text-gestorApp-gray font-medium">Preço de Venda</th>
                <th className="text-right pb-2 text-gestorApp-gray font-medium">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3">
                    <Button 
                      variant="link" 
                      className="font-medium p-0 h-auto text-gray-900 hover:text-blue-600"
                      onClick={() => navigateToProductDetail(product.id)}
                    >
                      {product.name}
                    </Button>
                    <div className="text-sm text-gestorApp-gray">{product.category}</div>
                  </td>
                  <td className="py-3 text-right">{product.currentStock} un.</td>
                  <td className="py-3 text-right">{formatCurrency(product.salePrice)}</td>
                  <td className="py-3 text-right font-medium">
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
