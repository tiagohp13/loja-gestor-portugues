import React, { memo, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';
import KpiDetailModal from './KpiDetailModal';

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
  const [selectedKpi, setSelectedKpi] = useState<{
    title: string;
    value: string;
    delta30d?: number;
    deltaMoM?: number;
    description?: string;
  } | null>(null);

  const metricsData = useMemo(() => [
    {
      title: 'Total de Vendas',
      value: formatCurrency(totalSales),
      color: 'text-green-600',
      delta: deltas?.sales,
      description: 'Soma total de todas as vendas registadas no sistema'
    },
    {
      title: 'Total Gasto',
      value: formatCurrency(totalSpent),
      color: 'text-red-600',
      delta: deltas?.spent,
      description: 'Soma total de compras e despesas registadas'
    },
    {
      title: 'Lucro',
      value: formatCurrency(profit),
      color: profit >= 0 ? 'text-green-600' : 'text-red-600',
      delta: deltas?.profit,
      description: 'Diferença entre o total de vendas e o total gasto'
    },
    {
      title: 'Margem de Lucro',
      value: `${profitMargin.toFixed(1)}%`,
      color: profitMargin >= 0 ? 'text-green-600' : 'text-red-600',
      delta: deltas?.margin,
      description: 'Percentagem de lucro em relação às vendas totais'
    }
  ], [totalSales, totalSpent, profit, profitMargin, deltas]);

  const handleCardClick = (metric: typeof metricsData[0]) => {
    setSelectedKpi({
      title: metric.title,
      value: metric.value,
      delta30d: metric.delta?.pct30d,
      deltaMoM: metric.delta?.pctMoM,
      description: metric.description
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <Card 
            key={metric.title}
            className="animate-fade-in cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all" 
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleCardClick(metric)}
          >
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

      <KpiDetailModal
        isOpen={!!selectedKpi}
        onClose={() => setSelectedKpi(null)}
        title={selectedKpi?.title || ''}
        value={selectedKpi?.value || ''}
        delta30d={selectedKpi?.delta30d}
        deltaMoM={selectedKpi?.deltaMoM}
        description={selectedKpi?.description}
      />
    </>
  );
});

DashboardMetrics.displayName = 'DashboardMetrics';

export default DashboardMetrics;