
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ExpenseTotalCardProps {
  total: number;
}

const ExpenseTotalCard: React.FC<ExpenseTotalCardProps> = ({ total }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  if (total === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-2xl font-bold text-gestorApp-blue">
              Total: {formatCurrency(total)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseTotalCard;
