import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';

// Memoized components for better performance
const DashboardMetrics = memo(({ 
  totalSales, 
  totalSpent, 
  profit, 
  profitMargin 
}: {
  totalSales: number;
  totalSpent: number; 
  profit: number;
  profitMargin: number;
}) => {
  const metricsData = useMemo(() => [
    {
      title: 'Total de Vendas',
      value: formatCurrency(totalSales),
      color: 'text-green-600'
    },
    {
      title: 'Total Gasto',
      value: formatCurrency(totalSpent),
      color: 'text-red-600'
    },
    {
      title: 'Lucro',
      value: formatCurrency(profit),
      color: profit >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Margem de Lucro',
      value: `${profitMargin.toFixed(1)}%`,
      color: profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ], [totalSales, totalSpent, profit, profitMargin]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric, index) => (
        <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

DashboardMetrics.displayName = 'DashboardMetrics';

export default DashboardMetrics;