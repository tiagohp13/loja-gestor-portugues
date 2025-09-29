import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTopClients } from '@/hooks/useTopClients';
import { formatCurrency } from '@/utils/formatting';
import { Skeleton } from '@/components/ui/skeleton';

interface TopClientsSectionProps {
  onViewAllClick: () => void;
}

const TopClientsSection: React.FC<TopClientsSectionProps> = ({ onViewAllClick }) => {
  const navigate = useNavigate();
  const { topClients, isLoading } = useTopClients();

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top 5 Clientes por Valor Gasto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topClients.length === 0) {
    return (
      <Card className="mb-6">
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
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top 5 Clientes por Valor Gasto
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewAllClick}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topClients.map((client, index) => (
            <Card 
              key={client.id} 
              className="relative cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
              onClick={() => navigate(`/clientes/${client.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2" title={client.name}>
                  {client.name}
                </h3>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(client.totalSpent)}
                </p>
                {client.email && (
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={client.email}>
                    {client.email}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress bars showing relative spending */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Comparação relativa
          </h4>
          {topClients.map((client, index) => {
            const maxSpent = topClients[0]?.totalSpent || 1;
            const percentage = (client.totalSpent / maxSpent) * 100;
            
            return (
              <div key={client.id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-6">
                  #{index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" title={client.name}>
                      {client.name}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(client.totalSpent)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopClientsSection;