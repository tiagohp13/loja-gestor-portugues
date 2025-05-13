
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyKpiData {
  month: Date;
  value: number;
}

interface KpiMonthlyTableProps {
  title: string;
  data: MonthlyKpiData[];
  isPercentage?: boolean;
  isCurrency?: boolean;
}

const KpiMonthlyTable: React.FC<KpiMonthlyTableProps> = ({ 
  title, 
  data,
  isPercentage = false,
  isCurrency = false
}) => {
  const [showMonths, setShowMonths] = useState<6 | 12>(6);
  
  // Format the value based on its type
  const formatValue = (value: number) => {
    if (isPercentage) return formatPercentage(value);
    if (isCurrency) return formatCurrency(value);
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  };
  
  // Filter data to show only the requested number of months
  const displayData = data
    .sort((a, b) => b.month.getTime() - a.month.getTime()) // Sort by date, newest first
    .slice(0, showMonths);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">{title} - Valores Mensais</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant={showMonths === 6 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMonths(6)}
          >
            Últimos 6 Meses
          </Button>
          <Button 
            variant={showMonths === 12 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMonths(12)}
          >
            Últimos 12 Meses
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.length > 0 ? (
              displayData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {format(item.month, 'MMMM yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">{formatValue(item.value)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                  Não existem dados para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default KpiMonthlyTable;
