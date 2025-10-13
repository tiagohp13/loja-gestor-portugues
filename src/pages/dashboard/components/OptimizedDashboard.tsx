import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatting";

interface KpiDelta {
  pct30d?: number;
  pctMoM?: number;
}

// Memoized components for better performance
const DashboardMetrics = memo(
  ({
    totalSales,
    totalSpent,
    profit,
    profitMargin,
    deltas,
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
    const metricsData = useMemo(
      () => [
        {
          title: "Total de Vendas",
          value: formatCurrency(totalSales),
          color: "text-green-600",
          delta: deltas?.sales,
        },
        {
          title: "Total Gasto",
          value: formatCurrency(totalSpent),
          color: "text-red-600",
          delta: deltas?.spent,
        },
        {
          title: "Lucro",
          value: formatCurrency(profit),
          color: profit >= 0 ? "text-green-600" : "text-red-600",
          delta: deltas?.profit,
        },
        {
          title: "Margem de Lucro",
          value: `${profitMargin.toFixed(1)}%`,
          color: profitMargin >= 0 ? "text-green-600" : "text-red-600",
          delta: deltas?.margin,
        },
      ],
      [totalSales, totalSpent, profit, profitMargin, deltas],
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>

              {/* Indicadores de variação */}
              {metric.delta && (metric.delta.pct30d !== undefined || metric.delta.pctMoM !== undefined) && (
                <div className="mt-2 flex items-center justify-center gap-3 text-xs font-medium text-gray-500">
                  {/* Últimos 30 dias */}
                  {typeof metric.delta.pct30d === "number" && (
                    <span
                      className={`flex items-center gap-1 ${
                        metric.delta.pct30d >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                      title="Variação nos últimos 30 dias"
                    >
                      {metric.delta.pct30d >= 0 ? "▲" : "▼"} 30d {Math.abs(metric.delta.pct30d).toFixed(1)}%
                    </span>
                  )}

                  {/* Separador */}
                  <span className="text-gray-400">|</span>

                  {/* Mês vs Mês */}
                  {typeof metric.delta.pctMoM === "number" && (
                    <span
                      className={`flex items-center gap-1 ${
                        metric.delta.pctMoM >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                      title="Variação do mês atual vs mês anterior"
                    >
                      {metric.delta.pctMoM >= 0 ? "▲" : "▼"} M/M {Math.abs(metric.delta.pctMoM).toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  },
);

DashboardMetrics.displayName = "DashboardMetrics";

export default DashboardMetrics;
