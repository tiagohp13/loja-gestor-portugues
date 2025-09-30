import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTopClients } from '@/hooks/useTopClients';
import { formatCurrency } from '@/utils/formatting';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
interface TopClientsSectionProps {
  onViewAllClick: () => void;
}
const TopClientsSection: React.FC<TopClientsSectionProps> = ({
  onViewAllClick
}) => {
  const navigate = useNavigate();
  const {
    topClients,
    isLoading
  } = useTopClients();
  if (isLoading) {
    return <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top 5 Clientes por Valor Gasto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({
            length: 5
          }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
          </div>
        </CardContent>
      </Card>;
  }
  if (topClients.length === 0) {
    return <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top 5 Clientes por Valor Gasto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Ainda não existem vendas registadas
          </div>
        </CardContent>
      </Card>;
  }

  const maxSpent = topClients[0]?.totalSpent || 0;

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-2xl" title="1º Lugar">🥇</span>;
      case 1:
        return <span className="text-2xl" title="2º Lugar">🥈</span>;
      case 2:
        return <span className="text-2xl" title="3º Lugar">🥉</span>;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
          </div>
        );
    }
  };
  return <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top 5 Clientes por Valor Gasto
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onViewAllClick} className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topClients.map((client, index) => {
            const progressValue = maxSpent > 0 ? (client.totalSpent / maxSpent) * 100 : 0;
            
            return (
              <Card 
                key={client.id} 
                onClick={() => navigate(`/clientes/${client.id}`)} 
                className="relative cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-primary"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Rank Badge */}
                  <div className="flex items-center justify-center">
                    {getRankBadge(index)}
                  </div>

                  {/* Client Name */}
                  <h3 className="font-semibold text-sm text-center line-clamp-2 min-h-[2.5rem] text-foreground" title={client.name}>
                    {client.name}
                  </h3>

                  {/* Amount */}
                  <p className="font-bold text-lg text-center text-green-600 dark:text-green-500">
                    {formatCurrency(client.totalSpent)}
                  </p>

                  {/* Progress Bar */}
                  <div className="relative">
                    <Progress 
                      value={progressValue} 
                      className="h-2 bg-muted"
                    />
                  </div>

                  {/* Email */}
                  {client.email && (
                    <p className="text-xs text-muted-foreground text-center truncate" title={client.email}>
                      {client.email}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>;
};
export default TopClientsSection;