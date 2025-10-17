import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, Euro, TrendingUp, Award } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';

interface ClientKpisProps {
  activeClients30d: number;
  newClients30d: number;
  totalSpentCurrentMonth: number;
  avgSpentPerActiveClient: number;
  top5Percentage: number;
}

const ClientKpis: React.FC<ClientKpisProps> = ({
  activeClients30d,
  newClients30d,
  totalSpentCurrentMonth,
  avgSpentPerActiveClient,
  top5Percentage,
}) => {
  const kpis = [
    {
      icon: Users,
      label: 'Clientes Ativos (30 dias)',
      value: activeClients30d.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: UserPlus,
      label: 'Novos Clientes (30 dias)',
      value: newClients30d.toString(),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Euro,
      label: 'Valor Total Gasto (mês atual)',
      value: formatCurrency(totalSpentCurrentMonth),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: 'Valor Médio por Cliente Ativo',
      value: formatCurrency(avgSpentPerActiveClient),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Award,
      label: '% dos 5 Melhores Clientes',
      value: `${top5Percentage.toFixed(1)}%`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ClientKpis;
