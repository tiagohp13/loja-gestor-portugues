import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

interface StockExitTotalCardProps {
  totalCount: number;
}

const StockExitTotalCard: React.FC<StockExitTotalCardProps> = ({ totalCount }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-gestorApp-blue">
          <Receipt className="w-5 h-5" />
          <span className="text-sm font-medium">Total de vendas: {totalCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockExitTotalCard;
