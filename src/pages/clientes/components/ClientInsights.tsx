import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const insights: {
    type: 'info' | 'warning' | 'critical' | 'success';
    icon: React.ElementType;
    title: string;
    suggestion?: string;
    action?: { label: string; onClick: () => void };
  }[] = [];

  // 🔸 Clientes inativos há mais de 90 dias
  if (inactiveClients90d > 0) {
    const percentInativos = (inactiveClients90d / totalClients) * 100;
    let type: 'warning' | 'critical' | 'info' = 'info';
    if (percentInativos > 50) type = 'critical';
    else if (percentInativos > 20) type = 'warning';

    insights.push({
      type,
      icon: AlertTriangle,
      title: `${inactiveClients90d} cliente${inactiveClients90d > 1 ? 's' : ''} não compra${inactiveClients90d > 1 ? 'm' : ''} há mais de 90 dias.`,
      suggestion: 'Considere reativar esses clientes com uma promoção.',
      action: {
        label: 'Ver lista',
        onClick: () => navigate('/clientes?status=Inativo'),
      },
    });
  }

  // 🟢 Novos clientes
  if (newClients30d > 0) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: `${newClients30d} novo${newClients30d > 1 ? 's' : ''} cliente${newClients30d > 1 ? 's' : ''} este mês.`,
      suggestion: 'O crescimento está positivo!',
      action: {
        label: 'Ver novos',
        onClick: () => navigate('/clientes?novo=1'),
      },
    });
  }

  // 🎯 Concentração de receita
  if (top5Percentage > 0) {
    const concentrationLevel = top5Percentage > 70 ? 'alta' : top5Percentage > 50 ? 'moderada' : 'equilibrada';
    let type: 'critical' | 'warning' | 'success' = 'success';
    if (top5Percentage > 70) type = 'critical';
    else if (top5Percentage > 50) type = 'warning';

    insights.push({
      type,
      icon: Target,
      title: `Os 5 principais clientes representam ${top5Percentage.toFixed(1)}% do total faturado este mês.`,
      suggestion: `Concentração ${concentrationLevel}.`,
      action: {
        label: 'Ver Top 5',
        onClick: () => navigate('/clientes?view=top5'),
      },
    });
  }

  // 💸 Mudança no valor médio gasto
  if (avgSpentChange !== 0) {
    const isIncrease = avgSpentChange > 0;
    const absChange = Math.abs(avgSpentChange);
    if (absChange > 5) {
      insights.push({
        type: isIncrease ? 'success' : 'warning',
        icon: isIncrease ? TrendingUp : TrendingDown,
        title: isIncrease
          ? `O valor médio gasto por cliente aumentou ${absChange.toFixed(1)}% em relação ao mês anterior.`
          : `O valor médio gasto por cliente caiu ${absChange.toFixed(1)}% em relação ao mês anterior.`,
        suggestion: isIncrease
          ? 'Bom sinal — ticket médio em crescimento.'
          : 'Avalie a causa da redução no ticket médio.',
        action: {
          label: 'Ver vendas',
          onClick: () => navigate('/estatisticas'),
        },
      });
    }
  }

  if (insights.length === 0) return null;

  // 🎨 Cores automáticas conforme severidade
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  // 🧠 Resumo automático
  const summaryParts: string[] = [];
  if (inactiveClients90d > 0) summaryParts.push('atenção à retenção');
  if (newClients30d > 0) summaryParts.push('crescimento positivo');
  if (top5Percentage > 70) summaryParts.push('alta concentração de faturação');
  if (avgSpentChange > 5) summaryParts.push('ticket médio em alta');
  if (avgSpentChange < -5) summaryParts.push('ticket médio em queda');

  const summary =
    summaryParts.length > 0
      ? `Resumo: ${summaryParts.join(', ')}.`
      : 'Tudo estável este mês.';

  return (
    <div className="space-y-3 mb-6 fade-in">
      <h3 className="text-lg font-semibold mb-2">📊 Análise e Recomendações</h3>
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        return (
          <Alert
            key={index}
            variant="default"
            className={`flex items-start justify-between ${getAlertStyle(insight.type)} fade-in`}
          >
            <div>
              <div className="flex items-center gap-2 font-medium">
                <Icon className="h-4 w-4" />
                <span>{insight.title}</span>
              </div>
              {insight.suggestion && (
                <p className="text-sm mt-1 opacity-80">{insight.suggestion}</p>
              )}
            </div>
            {insight.action && (
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={insight.action.onClick}
              >
                {insight.action.label}
              </Button>
            )}
          </Alert>
        );
      })}

      <div className="mt-3 text-sm text-muted-foreground italic">
        💬 {summary}
      </div>
    </div>
  );
};

export default ClientInsights;
