
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../hooks/useSupportData';
import KPICard from '@/components/statistics/KPICard';
import { KPI } from '@/components/statistics/KPIPanel';

interface SummaryCardsProps {
  stats: SupportStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  // Create KPI objects for the summary cards
  const kpis: KPI[] = [
    // Total de Vendas
    {
      name: "Total de Vendas",
      value: stats.totalSales,
      target: stats.totalSales * 1.1, // Example target: 10% more than current
      unit: '€',
      isPercentage: false,
      previousValue: stats.monthlySales && stats.monthlySales.length > 1 
        ? stats.monthlySales[stats.monthlySales.length - 2]?.value || 0 
        : undefined,
      description: "Total de vendas realizadas no período.",
      formula: "Soma de todas as vendas",
      belowTarget: false
    },
    
    // Total Gasto
    {
      name: "Total Gasto",
      value: stats.totalSpent,
      target: stats.totalSpent * 0.9, // Example target: 10% less than current (spend less)
      unit: '€',
      isPercentage: false,
      previousValue: stats.monthlyData && stats.monthlyData.length > 1 
        ? stats.monthlyData[stats.monthlyData.length - 2]?.purchases || 0 
        : undefined,
      description: "Total gasto em compras no período.",
      formula: "Soma de todas as compras",
      belowTarget: false,
      isInverseKPI: true // Lower is better for spending
    },
    
    // Lucro
    {
      name: "Lucro",
      value: stats.profit,
      target: stats.profit * 1.1, // Example target: 10% more than current
      unit: '€',
      isPercentage: false,
      previousValue: stats.monthlyData && stats.monthlyData.length > 1 
        ? (stats.monthlyData[stats.monthlyData.length - 2]?.sales || 0) - 
          (stats.monthlyData[stats.monthlyData.length - 2]?.purchases || 0) 
        : undefined,
      description: "Lucro obtido no período (Vendas - Compras).",
      formula: "Total de Vendas - Total de Compras",
      belowTarget: false
    },
    
    // Margem de Lucro
    {
      name: "Margem de Lucro",
      value: stats.profitMargin,
      target: stats.profitMargin * 1.05, // Example target: 5% more than current
      unit: '%',
      isPercentage: true,
      previousValue: stats.monthlyData && stats.monthlyData.length > 1 
        ? (() => {
          // Calculate previous profit margin
          const prevSales = stats.monthlyData[stats.monthlyData.length - 2]?.sales || 0;
          const prevPurchases = stats.monthlyData[stats.monthlyData.length - 2]?.purchases || 0;
          return prevSales > 0 ? ((prevSales - prevPurchases) / prevSales) * 100 : 0;
        })() 
        : undefined,
      description: "Porcentagem de lucro em relação ao total de vendas.",
      formula: "(Lucro / Total de Vendas) × 100",
      belowTarget: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} kpi={kpi} />
      ))}
    </div>
  );
};

export default SummaryCards;
