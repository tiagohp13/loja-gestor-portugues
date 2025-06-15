import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../types/supportTypes';
import { useDashboardSummary } from '../../dashboard/hooks/useDashboardSummary';

const SummaryCards: React.FC = () => {
  // Use o hook otimizado para buscar os KPIs resumidos
  const { data: summary, isLoading, error } = useDashboardSummary();

  // Helper para spinner e erro
  if (isLoading) {
    return (
      <div className="flex gap-4 mb-6">
        <div className="h-24 w-60 bg-gray-100 animate-pulse rounded" />
        <div className="h-24 w-60 bg-gray-100 animate-pulse rounded" />
        <div className="h-24 w-60 bg-gray-100 animate-pulse rounded" />
        <div className="h-24 w-60 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }
  if (error || !summary) {
    return (
      <div className="text-center text-destructive mb-6">
        Erro ao carregar dados do resumo do dashboard.
      </div>
    );
  }

  // Render cards apenas com os 4 KPIs necessários e dados do hook otimizado
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
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</div>
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
            {summary.profit >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
            )}
            <div className="text-2xl font-bold">{formatCurrency(summary.profit)}</div>
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
            <div className="text-2xl font-bold">{formatPercentage(summary.profitMargin)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
