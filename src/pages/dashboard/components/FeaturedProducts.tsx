
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatting';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';

interface FeaturedProductsProps {
  products: Product[];
  navigateToProductDetail: (id: string) => void;
  maxItems?: number;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  products, 
  navigateToProductDetail,
  maxItems = 3
}) => {
  const navigate = useNavigate();
  
  // Sort products by value (stock * price) and get the top items
  const sortedProducts = [...products].sort((a, b) => 
    (b.currentStock * b.salePrice) - (a.currentStock * a.salePrice)
  ).slice(0, maxItems);

  const handleViewAllProducts = () => {
    navigate('/produtos/consultar');
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>Produtos em Destaque</CardTitle>
        <Button 
          variant="link" 
          onClick={handleViewAllProducts}
          className="text-blue-500 h-auto p-0 text-sm"
        >
          Ver todos
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2 text-gray-500 font-medium">Produto</th>
                <th className="text-right pb-2 text-gray-500 font-medium">Quantidade Vendida</th>
                <th className="text-right pb-2 text-gray-500 font-medium">Preço Unitário</th>
                <th className="text-right pb-2 text-gray-500 font-medium">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3">
                    <Button 
                      variant="link" 
                      className="font-medium p-0 h-auto text-blue-500 hover:underline transition-colors"
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
