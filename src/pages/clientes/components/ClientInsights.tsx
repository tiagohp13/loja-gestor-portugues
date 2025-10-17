import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface ClientInsightsProps {
  inactiveClients90d: number;
  newClients30d: number;
  top5Percentage: number;
  avgSpentChange: number;
  totalClients: number;
}

const ClientInsights: React.FC<ClientInsightsProps> = ({
  inactiveClients90d,
  newClients30d,
  top5Percentage,
  avgSpentChange,
  totalClients,
}) => {
  const insights = [];

  // Alerta: Clientes inativos há mais de 90 dias
  if (inactiveClients90d > 0) {
    insights.push({
      variant: 'default' as const,
      icon: AlertTriangle,
      message: `⚠️ ${inactiveClients90d} cliente${inactiveClients90d > 1 ? 's' : ''} não compra${inactiveClients90d > 1 ? 'm' : ''} há mais de 90 dias. Considere reativar esses clientes com uma promoção.`,
      color: 'text-orange-600',
    });
  }

  // Insight: Novos clientes este mês
  if (newClients30d > 0) {
    insights.push({
      variant: 'default' as const,
      icon: TrendingUp,
      message: `🟢 ${newClients30d} novo${newClients30d > 1 ? 's' : ''} cliente${newClients30d > 1 ? 's' : ''} este mês. O crescimento está positivo!`,
      color: 'text-green-600',
    });
  }

  // Insight: Concentração de receita nos top 5
  if (top5Percentage > 0) {
    const concentrationLevel = top5Percentage > 70 ? 'alta' : top5Percentage > 50 ? 'moderada' : 'equilibrada';
    const emoji = top5Percentage > 70 ? '🔴' : top5Percentage > 50 ? '🟡' : '🟢';
    insights.push({
      variant: 'default' as const,
      icon: Target,
      message: `${emoji} Os 5 principais clientes representam ${top5Percentage.toFixed(1)}% do total faturado este mês (concentração ${concentrationLevel}).`,
      color: top5Percentage > 70 ? 'text-red-600' : top5Percentage > 50 ? 'text-yellow-600' : 'text-blue-600',
    });
  }

  // Insight: Mudança no valor médio gasto
  if (avgSpentChange !== 0) {
    const isIncrease = avgSpentChange > 0;
    const absChange = Math.abs(avgSpentChange);
    if (absChange > 5) { // Só mostrar se a mudança for significativa (> 5%)
      insights.push({
        variant: 'default' as const,
        icon: isIncrease ? TrendingUp : TrendingDown,
        message: isIncrease
          ? `🟢 O valor médio gasto por cliente aumentou ${absChange.toFixed(1)}% em relação ao mês anterior.`
          : `🔵 O valor médio gasto por cliente caiu ${absChange.toFixed(1)}% em relação ao mês anterior.`,
        color: isIncrease ? 'text-green-600' : 'text-blue-600',
      });
    }
  }

  // Se não há insights, não mostrar nada
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        return (
          <Alert key={index} variant={insight.variant} className="border-l-4">
            <Icon className={`h-4 w-4 ${insight.color}`} />
            <AlertDescription className={insight.color}>
              {insight.message}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};

export default ClientInsights;
