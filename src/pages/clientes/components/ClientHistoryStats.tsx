
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientHistoryStatsProps {
  ordersCount: number;
  exitsCount: number;
}

const ClientHistoryStats: React.FC<ClientHistoryStatsProps> = ({ ordersCount, exitsCount }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Total de encomendas: {ordersCount}</p>
          <p>Total de saídas: {exitsCount}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientHistoryStats;
