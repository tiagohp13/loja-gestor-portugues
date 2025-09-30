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
        <div className="space-y-1">
          {topClients.map((client, index) => {
            const progressValue = maxSpent > 0 ? (client.totalSpent / maxSpent) * 100 : 0;
            
            return (
              <div
                key={client.id}
                className={cn(
                  "relative py-4 px-4 cursor-pointer transition-colors hover:bg-accent/50 rounded-md",
                  index < topClients.length - 1 && "border-b border-border"
                )}
                onClick={() => navigate(`/clientes/${client.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {getRankBadge(index)}
                  </div>

                  {/* Client Info and Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-base text-foreground truncate pr-4" title={client.name}>
                        {client.name}
                      </h3>
                      <p className="font-semibold text-base text-green-600 dark:text-green-500 whitespace-nowrap">
                        {formatCurrency(client.totalSpent)}
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative">
                      <Progress 
                        value={progressValue} 
                        className="h-2 bg-muted"
                      />
                    </div>

                    {client.email && (
                      <p className="text-xs text-muted-foreground mt-2 truncate" title={client.email}>
                        {client.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>;
};
export default TopClientsSection;