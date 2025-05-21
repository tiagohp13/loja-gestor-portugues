
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SupportStats } from '../types/supportTypes';
import KpiGrid from './kpi/KpiGrid';

interface OperationsSummaryProps {
  stats: SupportStats;
}

const OperationsSummary: React.FC<OperationsSummaryProps> = ({
  stats
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Métricas de Operação</CardTitle>
        <CardDescription>Principais KPIs e indicadores de desempenho do negócio</CardDescription>
      </CardHeader>
      <CardContent>
        <KpiGrid stats={stats} />
      </CardContent>
    </Card>
  );
};

export default OperationsSummary;
