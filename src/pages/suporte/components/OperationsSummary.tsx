
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SupportStats } from '../hooks/useSupportData';
import KpiGrid from './kpi/KpiGrid';

interface OperationsSummaryProps {
  stats: SupportStats;
}

const OperationsSummary: React.FC<OperationsSummaryProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores Operacionais</CardTitle>
        <CardDescription>KPIs calculados com base nos dados do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <KpiGrid stats={stats} />
      </CardContent>
    </Card>
  );
};

export default OperationsSummary;
