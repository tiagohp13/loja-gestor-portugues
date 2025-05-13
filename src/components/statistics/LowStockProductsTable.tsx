
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price?: number;
  category?: string;
}

interface LowStockProductsTableProps {
  products: Product[];
  navigateToProduct: (id: string) => void;
}

const LowStockProductsTable: React.FC<LowStockProductsTableProps> = ({
  products,
  navigateToProduct
}) => {
  // Sort products by lowest stock relative to min stock first
  const sortedProducts = [...products].sort((a, b) => {
    const aDiff = a.stock - a.minStock;
    const bDiff = b.stock - b.minStock;
    return aDiff - bDiff;
  });

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Produtos com Stock Baixo</h3>
        
        {sortedProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Não existem produtos com stock abaixo do mínimo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Stock Atual</TableHead>
                  <TableHead className="text-right">Stock Mínimo</TableHead>
                  <TableHead className="text-right">Défice</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product) => {
                  const stockDifference = product.stock - product.minStock;
                  const isVeryLow = stockDifference <= -5;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {isVeryLow && (
                            <AlertTriangle size={16} className="text-red-500 mr-2" />
                          )}
                          {product.name}
                        </div>
                        {product.category && (
                          <span className="text-xs text-gray-500 block mt-1">
                            {product.category}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell className="text-right">{product.minStock}</TableCell>
                      <TableCell className={`text-right font-medium ${stockDifference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stockDifference}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToProduct(product.id)}
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockProductsTable;
