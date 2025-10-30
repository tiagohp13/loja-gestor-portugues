
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProductStockCardProps {
  currentStock: number;
  minStock: number;
  hasImage?: boolean;
}

const ProductStockCard: React.FC<ProductStockCardProps> = ({ 
  currentStock, 
  minStock,
  hasImage 
}) => {
  const stockPercentage = Math.min(100, Math.max(0, (currentStock / (minStock * 2)) * 100));
  
  return (
    <Card className={hasImage ? 'md:col-span-3' : ''}>
      <CardHeader>
        <CardTitle>Stock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{currentStock}</p>
          <p className="text-sm text-muted-foreground">Unidades em Stock</p>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Stock Mínimo: {minStock}</span>
            <span className="font-medium">
              {currentStock < minStock ? (
                <Badge variant="destructive">Abaixo do Mínimo</Badge>
              ) : (
                <Badge variant="default">OK</Badge>
              )}
            </span>
          </div>
          <Progress 
            value={stockPercentage} 
            className={`h-2 ${stockPercentage < 50 ? 'bg-red-200' : 'bg-green-200'}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStockCard;
