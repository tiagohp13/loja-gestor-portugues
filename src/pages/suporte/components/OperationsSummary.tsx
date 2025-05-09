
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';
import { SupportStats } from '../hooks/useSupportData';

interface OperationsSummaryProps {
  stats: SupportStats;
}

const OperationsSummary: React.FC<OperationsSummaryProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Operações</CardTitle>
        <CardDescription>Visão geral das operações do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Encomendas</h3>
            <p>Pendentes: <span className="font-medium">{stats.pendingOrders}</span></p>
            <p>Concluídas: <span className="font-medium">{stats.completedOrders}</span></p>
            <p>Total: <span className="font-medium">{stats.pendingOrders + stats.completedOrders}</span></p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Financeiro</h3>
            <p>Total Vendas: <span className="font-medium">{formatCurrency(stats.totalSales)}</span></p>
            <p>Total Gastos: <span className="font-medium">{formatCurrency(stats.totalSpent)}</span></p>
            <p>Lucro: <span className="font-medium">{formatCurrency(stats.profit)}</span></p>
            <p>Margem: <span className="font-medium">{stats.profitMargin.toFixed(2)}%</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationsSummary;
