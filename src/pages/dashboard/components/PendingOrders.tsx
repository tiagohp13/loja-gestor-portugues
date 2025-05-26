
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/types';
import { formatCurrency } from '@/utils/formatting';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface PendingOrdersProps {
  pendingOrders: Order[];
  navigateToOrderDetail: (id: string) => void;
  navigateToClientDetail?: (id: string) => void;
}

const PendingOrders: React.FC<PendingOrdersProps> = ({ 
  pendingOrders,
  navigateToOrderDetail,
  navigateToClientDetail
}) => {
  // Limit to a maximum of 5 orders for display
  const displayOrders = pendingOrders.slice(0, 5);
  
  // Calculate total value for each order
  const calculateTotal = (order: Order) => {
    let total = 0;
    if (order.items && order.items.length > 0) {
      total = order.items.reduce((sum, item) => {
        const itemPrice = item.salePrice * item.quantity;
        const discount = item.discountPercent ? (itemPrice * (item.discountPercent / 100)) : 0;
        return sum + (itemPrice - discount);
      }, 0);
    }
    
    // Apply order-level discount if applicable
    if (order.discount && total > 0) {
      total = total * (1 - (order.discount / 100));
    }
    
    return total;
  };
  
  // Calculate total value of all displayed pending orders
  const totalPendingValue = displayOrders.reduce((sum, order) => {
    return sum + (order.total || calculateTotal(order));
  }, 0);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Encomendas Pendentes</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-0">
        {displayOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº da Encomenda</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-blue-600 hover:underline"
                          onClick={() => navigateToOrderDetail(order.id)}
                        >
                          {order.number}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {order.clientId && navigateToClientDetail ? (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-blue-600 hover:underline"
                            onClick={() => navigateToClientDetail(order.clientId!)}
                          >
                            {order.clientName || 'Cliente desconhecido'}
                          </Button>
                        ) : (
                          order.clientName || 'Cliente desconhecido'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total || calculateTotal(order))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="w-full text-right px-6 mt-3 text-sm text-gray-600">
              <span className="font-medium">Total:</span>
              <span className="ml-1 text-gray-900 font-semibold">{formatCurrency(totalPendingValue)}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Não existem encomendas pendentes.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingOrders;
