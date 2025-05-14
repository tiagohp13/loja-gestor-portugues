
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatting';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface FeaturedProductsProps {
  products: Product[];
  productSales: Record<string, number>;
  navigateToProductDetail: (id: string) => void;
  maxItems?: number;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  products, 
  productSales,
  navigateToProductDetail,
  maxItems = 3
}) => {
  const navigate = useNavigate();
  
  // Sort products by total sales quantity in descending order and get the top items
  const sortedProducts = [...products]
    .filter(product => productSales[product.id] > 0)
    .sort((a, b) => (productSales[b.id]) - (productSales[a.id]))
    .slice(0, maxItems);

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Quantidade Vendida</TableHead>
                <TableHead className="text-right">Preço Unitário</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="align-middle">
                      <div className="flex flex-col">
                        <Button 
                          variant="link" 
                          className="font-medium p-0 h-auto text-blue-500 hover:underline transition-colors text-left justify-start"
                          onClick={() => navigateToProductDetail(product.id)}
                        >
                          {product.name}
                        </Button>
                        <span className="text-sm text-gray-500">{product.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-middle">{productSales[product.id] || 0} un.</TableCell>
                    <TableCell className="text-right align-middle">{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell className="text-right align-middle font-medium text-green-600">
                      {formatCurrency((productSales[product.id] || 0) * product.salePrice)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    Nenhum produto com vendas encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedProducts;
