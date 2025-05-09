
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';
import { DollarSign, TrendingUp } from 'lucide-react';
import { SupportStats } from '../hooks/useSupportData';

interface SummaryCardsProps {
  stats: SupportStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
            <div className="text-2xl font-bold">{formatCurrency(stats.profit)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.profitMargin.toFixed(2)}%</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
