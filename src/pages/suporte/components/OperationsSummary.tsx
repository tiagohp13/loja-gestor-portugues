import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';
import { SupportStats } from '../hooks/useSupportData';
interface OperationsSummaryProps {
  stats: SupportStats;
}
const OperationsSummary: React.FC<OperationsSummaryProps> = ({
  stats
}) => {
  return;
};
export default OperationsSummary;