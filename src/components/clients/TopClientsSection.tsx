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
          {topClients.map((client, index) => <Card key={client.id} onClick={() => navigate(`/clientes/${client.id}`)} className="relative cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary bg-white/0">
              <CardContent className="p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-500">
                    #{index + 1}
                  </span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2" title={client.name}>
                  {client.name}
                </h3>
                <p className="font-medium text-[008000] text-[#008000]">
                  {formatCurrency(client.totalSpent)}
                </p>
                {client.email && <p className="text-xs text-muted-foreground mt-1 truncate" title={client.email}>
                    {client.email}
                  </p>}
              </CardContent>
            </Card>)}
        </div>

        {/* Progress bars showing relative spending */}
        
      </CardContent>
    </Card>;
};
export default TopClientsSection;