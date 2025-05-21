
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../types/supportTypes';

interface SummaryCardsProps {
  stats: SupportStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total de Vendas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Total Gasto */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-red-500" />
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Lucro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {stats.profit >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
            )}
            <div className="text-2xl font-bold">{formatCurrency(stats.profit)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Margem de Lucro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Percent className="w-4 h-4 mr-2 text-green-500" />
            <div className="text-2xl font-bold">{formatPercentage(stats.profitMargin)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
