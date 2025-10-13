import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';

interface KpiDelta {
  pct30d?: number;
  pctMoM?: number;
}

// Memoized components for better performance
const DashboardMetrics = memo(({ 
  totalSales, 
  totalSpent, 
  profit, 
  profitMargin,
  deltas
}: {
  totalSales: number;
  totalSpent: number; 
  profit: number;
  profitMargin: number;
  deltas?: {
    sales?: KpiDelta;
    spent?: KpiDelta;
    profit?: KpiDelta;
    margin?: KpiDelta;
  };
}) => {
  const metricsData = useMemo(() => [
    {
      title: 'Total de Vendas',
      value: formatCurrency(totalSales),
      color: 'text-green-600',
      delta: deltas?.sales
    },
    {
      title: 'Total Gasto',
      value: formatCurrency(totalSpent),
      color: 'text-red-600',
      delta: deltas?.spent
    },
    {
      title: 'Lucro',
      value: formatCurrency(profit),
      color: profit >= 0 ? 'text-green-600' : 'text-red-600',
      delta: deltas?.profit
    },
    {
      title: 'Margem de Lucro',
      value: `${profitMargin.toFixed(1)}%`,
      color: profitMargin >= 0 ? 'text-green-600' : 'text-red-600',
      delta: deltas?.margin
    }
  ], [totalSales, totalSpent, profit, profitMargin, deltas]);

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
            {metric.delta && (metric.delta.pct30d !== undefined || metric.delta.pctMoM !== undefined) && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {metric.delta.pct30d !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    metric.delta.pct30d >= 0 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    30d: {metric.delta.pct30d >= 0 ? '+' : ''}{metric.delta.pct30d.toFixed(1)}%
                  </span>
                )}
                {metric.delta.pctMoM !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    metric.delta.pctMoM >= 0 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    M/M: {metric.delta.pctMoM >= 0 ? '+' : ''}{metric.delta.pctMoM.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

DashboardMetrics.displayName = 'DashboardMetrics';

export default DashboardMetrics;