
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/formatting';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

const ConsumptionList = () => {
  const navigate = useNavigate();

  const { data: consumptions, isLoading } = useQuery({
    queryKey: ['consumptions'],
    queryFn: async () => {
      const { data, error } = await fetch('/api/consumptions').then(res => res.json());
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Consumo Interno"
        description="Gerir consumo interno de produtos"
        actions={
          <Button onClick={() => navigate('/consumo/novo')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Consumo
          </Button>
        }
      />

      {consumptions?.length === 0 ? (
        <EmptyState
          title="Sem registos de consumo"
          description="Comece por adicionar um novo registo de consumo interno."
          action={
            <Button onClick={() => navigate('/consumo/novo')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Consumo
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumptions?.map((consumption) => (
              <TableRow
                key={consumption.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/consumo/${consumption.id}`)}
              >
                <TableCell>{new Date(consumption.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{consumption.reference}</TableCell>
                <TableCell>{consumption.product_name}</TableCell>
                <TableCell>{consumption.quantity}</TableCell>
                <TableCell>{formatCurrency(consumption.total_value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ConsumptionList;
