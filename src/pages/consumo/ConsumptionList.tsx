
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';

const ConsumptionList = () => {
  const navigate = useNavigate();
  const { stockEntries } = useData();

  // Filter only consumption entries
  const consumptionEntries = stockEntries.filter(entry => entry.type === 'consumption');

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Consumo"
        description="Gerir entradas de consumo interno"
        actions={
          <Button onClick={() => navigate('/consumo/novo')}>
            Novo Consumo
          </Button>
        }
      />

      <Card className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referência</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumptionEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum registo de consumo encontrado
                </TableCell>
              </TableRow>
            ) : (
              consumptionEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/consumo/${entry.id}`)}
                >
                  <TableCell>{entry.number}</TableCell>
                  <TableCell>{formatDateString(entry.date)}</TableCell>
                  <TableCell>{entry.supplierName}</TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status || 'active'} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.items?.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0) || 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ConsumptionList;
