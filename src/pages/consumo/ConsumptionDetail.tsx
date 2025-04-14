
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDateString } from '@/utils/formatting';
import { ArrowLeft, Printer } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

const ConsumptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries } = useData();
  const [consumption, setConsumption] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const entry = stockEntries.find(e => e.id === id);
      
      if (entry && entry.type === 'consumption') {
        setConsumption(entry);
      }
      
      setLoading(false);
    }
  }, [id, stockEntries]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <p>A carregar...</p>
        </div>
      </div>
    );
  }

  if (!consumption) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Consumo não encontrado"
          description="O registo de consumo solicitado não foi encontrado."
          actions={
            <Button 
              variant="outline" 
              onClick={() => navigate('/consumo/consultar')}
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          }
        />
      </div>
    );
  }

  const total = consumption.items.reduce((sum: number, item: any) => 
    sum + (item.quantity * item.purchasePrice), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`Consumo: ${consumption.number}`}
        description="Detalhes da entrada de consumo"
        actions={
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/consumo/consultar')}
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-sm text-gray-500 mb-1">Fornecedor</h3>
            <p className="font-semibold">{consumption.supplierName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-sm text-gray-500 mb-1">Data</h3>
            <p className="font-semibold">{formatDateString(consumption.date)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-sm text-gray-500 mb-1">Estado</h3>
            <StatusBadge status={consumption.status || 'active'} />
          </CardContent>
        </Card>
      </div>

      {consumption.invoiceNumber && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-sm text-gray-500 mb-1">Número da Fatura</h3>
            <p>{consumption.invoiceNumber}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-medium text-lg mb-4">Produtos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumption.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.purchasePrice)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.quantity * item.purchasePrice)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {consumption.notes && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-sm text-gray-500 mb-1">Notas</h3>
            <p>{consumption.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsumptionDetail;
