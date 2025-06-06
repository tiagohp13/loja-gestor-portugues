import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../types/supportTypes';

interface SummaryCardsProps {
  stats: SupportStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  // Helper function to render variation indicator
  const renderVariation = (currentValue: number, previousValue: number) => {
    // Se não houver mês anterior, não exibimos nada
    if (!previousValue && previousValue !== 0) return null;
    // OBS: retirei a checagem de (currentValue === 0), pois queremos mostrar
    // “-100%” caso currentValue seja realmente zero e previousValue > 0.

    // Se ambos os valores (anterior e atual) forem exatamente zero, mostramos “0.0%”
    // (diff = 0, percentChange = 0)
    const diff = currentValue - previousValue;
    const percentChange = previousValue === 0
      ? 0
      : (diff / previousValue) * 100;
    const isPositive = percentChange >= 0;

    return (
      <div
        className={`flex items-center text-sm ${
          isPositive ? 'text-green-500' : 'text-red-500'
        } mt-1`}
      >
        {isPositive ? (
          <ArrowUp className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDown className="h-3 w-3 mr-1" />
        )}
        <span>
          {isPositive ? '+' : ''}
          {percentChange.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* ======================================= */}
      {/* Total de Vendas */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalSales)}
              </div>
            </div>
            {stats.monthlySales && stats.monthlySales.length > 1 && (
              renderVariation(
                stats.monthlySales[stats.monthlySales.length - 1] || 0,
                stats.monthlySales[stats.monthlySales.length - 2] || 0
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* ======================================= */}
      {/* Total Gasto (compras + despesas) */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Gasto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-red-500" />
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalSpent)}
              </div>
            </div>
            {stats.monthlyData && stats.monthlyData.length > 1 && (() => {
              // Índices: último mês e penúltimo mês
              const lastIdx = stats.monthlyData.length - 1;
              const prevIdx = stats.monthlyData.length - 2;

              // Compras do mês atual e anterior
              const currentCompras = stats.monthlyData[lastIdx]?.compras || 0;
              const previousCompras = stats.monthlyData[prevIdx]?.compras || 0;

              // Despesas do mês atual e anterior:
              // - primeiro tento ler de monthlyData[…].despesas
              // - se não existir, faço fallback para stats.monthlyExpenses (caso venha separado)
              const currentDespesas =
                stats.monthlyData[lastIdx]?.despesas ??
                (stats.monthlyExpenses?.[lastIdx] || 0);
              const previousDespesas =
                stats.monthlyData[prevIdx]?.despesas ??
                (stats.monthlyExpenses?.[prevIdx] || 0);

              // Soma compras + despesas para cada mês
              const currentTotalGasto = currentCompras + currentDespesas;
              const previousTotalGasto = previousCompras + previousDespesas;

              return renderVariation(currentTotalGasto, previousTotalGasto);
            })()}
          </div>
        </CardContent>
      </Card>

      {/* ======================================= */}
      {/* Lucro (vendas – (compras + despesas)) */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              {stats.profit >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
              )}
              <div className="text-2xl font-bold">
                {formatCurrency(stats.profit)}
              </div>
            </div>
            {stats.monthlyData && stats.monthlyData.length > 1 && (() => {
              const lastIdx = stats.monthlyData.length - 1;
              const prevIdx = stats.monthlyData.length - 2;

              const curVendas = stats.monthlyData[lastIdx]?.vendas || 0;
              const prevVendas = stats.monthlyData[prevIdx]?.vendas || 0;

              const curCompras = stats.monthlyData[lastIdx]?.compras || 0;
              const prevCompras = stats.monthlyData[prevIdx]?.compras || 0;

              const curDespesas =
                stats.monthlyData[lastIdx]?.despesas ??
                (stats.monthlyExpenses?.[lastIdx] || 0);
              const prevDespesas =
                stats.monthlyData[prevIdx]?.despesas ??
                (stats.monthlyExpenses?.[prevIdx] || 0);

              const currentProfit = curVendas - (curCompras + curDespesas);
              const previousProfit = prevVendas - (prevCompras + prevDespesas);

              return renderVariation(currentProfit, previousProfit);
            })()}
          </div>
        </CardContent>
      </Card>

      {/* ======================================= */}
      {/* Margem de Lucro (com despesas incluídas) */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Margem de Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Percent className="w-4 h-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">
                {formatPercentage(stats.profitMargin)}
              </div>
            </div>
            {stats.monthlyData && stats.monthlyData.length > 1 && (() => {
              const lastIdx = stats.monthlyData.length - 1;
              const prevIdx = stats.monthlyData.length - 2;

              const cVendas = stats.monthlyData[lastIdx]?.vendas || 0;
              const pVendas = stats.monthlyData[prevIdx]?.vendas || 0;

              const cCompras = stats.monthlyData[lastIdx]?.compras || 0;
              const pCompras = stats.monthlyData[prevIdx]?.compras || 0;

              const cDespesas =
                stats.monthlyData[lastIdx]?.despesas ??
                (stats.monthlyExpenses?.[lastIdx] || 0);
              const pDespesas =
                stats.monthlyData[prevIdx]?.despesas ??
                (stats.monthlyExpenses?.[prevIdx] || 0);

              const currentMargin =
                cVendas > 0
                  ? ((cVendas - (cCompras + cDespesas)) / cVendas) * 100
                  : 0;
              const previousMargin =
                pVendas > 0
                  ? ((pVendas - (pCompras + pDespesas)) / pVendas) * 100
                  : 0;

              return renderVariation(currentMargin, previousMargin);
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
