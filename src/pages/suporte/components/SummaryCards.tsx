
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../types/supportTypes';

interface SummaryCardsProps {
  stats: SupportStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  // Helper function to render variation indicator
  const renderVariation = (currentValue: number, previousValue: number) => {
    if (previousValue === 0 || !previousValue) return null;
    
    const diff = currentValue - previousValue;
    const percentChange = (diff / previousValue) * 100;
    const isPositive = percentChange >= 0;
    
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'} mt-1`}>
        {isPositive ? (
          <ArrowUp className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDown className="h-3 w-3 mr-1" />
        )}
        <span>{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total de Vendas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            </div>
            {stats.monthlySales && stats.monthlySales.length > 1 && 
              renderVariation(
                stats.monthlySales[stats.monthlySales.length - 1] || 0,
                stats.monthlySales[stats.monthlySales.length - 2] || 0
              )
            }
          </div>
        </CardContent>
      </Card>

      {/* Total Gasto */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-red-500" />
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            </div>
            {stats.monthlyData && stats.monthlyData.length > 1 && 
              renderVariation(
                stats.monthlyData[stats.monthlyData.length - 1]?.compras || 0,
                stats.monthlyData[stats.monthlyData.length - 2]?.compras || 0
              )
            }
          </div>
        </CardContent>
      </Card>

      {/* Lucro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              {stats.profit >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
              )}
              <div className="text-2xl font-bold">{formatCurrency(stats.profit)}</div>
            </div>
            {stats.monthlyData && stats.monthlyData.length > 1 && 
              renderVariation(
                (stats.monthlyData[stats.monthlyData.length - 1]?.vendas || 0) - (stats.monthlyData[stats.monthlyData.length - 1]?.compras || 0),
                (stats.monthlyData[stats.monthlyData.length - 2]?.vendas || 0) - (stats.monthlyData[stats.monthlyData.length - 2]?.compras || 0)
              )
            }
          </div>
        </CardContent>
      </Card>

      {/* Margem de Lucro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Percent className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{formatPercentage(stats.profitMargin)}</div>
            </div>
            {stats.monthlyData && stats.monthlyData.length > 1 && (() => {
              // Calculate current and previous profit margins
              const currentSales = stats.monthlyData[stats.monthlyData.length - 1]?.vendas || 0;
              const currentPurchases = stats.monthlyData[stats.monthlyData.length - 1]?.compras || 0;
              const previousSales = stats.monthlyData[stats.monthlyData.length - 2]?.vendas || 0;
              const previousPurchases = stats.monthlyData[stats.monthlyData.length - 2]?.compras || 0;
              
              const currentMargin = currentSales > 0 ? ((currentSales - currentPurchases) / currentSales) * 100 : 0;
              const previousMargin = previousSales > 0 ? ((previousSales - previousPurchases) / previousSales) * 100 : 0;
              
              return renderVariation(currentMargin, previousMargin);
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
