import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PendingOrderItem } from '../types/productHistoryTypes';
import { formatCurrency } from '@/utils/formatting';

interface PendingOrdersHistoryProps {
  pendingOrdersForProduct: PendingOrderItem[];
}

const PendingOrdersHistory: React.FC<PendingOrdersHistoryProps> = ({ 
  pendingOrdersForProduct = []
}) => {
  const navigate = useNavigate();
  
  const totalQuantityOrdered = pendingOrdersForProduct?.reduce((sum, order) => sum + order.quantity, 0) || 0;
  const totalValueOrdered = pendingOrdersForProduct?.reduce((sum, order) => sum + order.total, 0) || 0;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Encomendas Pendentes</h3>
      {pendingOrdersForProduct.length === 0 ? (
        <p className="text-muted-foreground">Sem encomendas pendentes para este produto.</p>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Encomenda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrdersForProduct.map((order, index) => (
                <TableRow 
                  key={`${order.orderId}-${index}`}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => navigate(`/encomendas/${order.orderId}`)}
                >
                  <TableCell>{new Date(order.date).toLocaleDateString('pt-PT')}</TableCell>
                  <TableCell className="font-medium text-primary hover:underline">{order.number}</TableCell>
                  <TableCell className="text-primary hover:underline">{order.clientName}</TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">{totalQuantityOrdered}</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{formatCurrency(totalValueOrdered)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PendingOrdersHistory;
