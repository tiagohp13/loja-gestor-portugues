
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { Product, Order, OrderItem } from '@/types';

type InsufficientStockItem = {
  product: Product;
  order: Order;
  clientName: string;
  missingQuantity: number;
  orderItem: OrderItem;
};

interface InsufficientStockOrdersProps {
  insufficientItems: InsufficientStockItem[];
  navigateToProductDetail: (id: string) => void;
  navigateToOrderDetail: (id: string) => void;
  navigateToClientDetail: (id: string) => void;
}

const InsufficientStockOrders: React.FC<InsufficientStockOrdersProps> = ({
  insufficientItems,
  navigateToProductDetail,
  navigateToOrderDetail,
  navigateToClientDetail,
}) => {
  if (insufficientItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Encomendas com Stock Insuficiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Não existem encomendas com stock insuficiente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Encomendas com Stock Insuficiente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Falta Comprar</TableHead>
                <TableHead>Encomenda</TableHead>
                <TableHead>Cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insufficientItems.map((item, index) => (
                <TableRow key={`${item.order.id}-${item.product.id}-${index}`}>
                  <TableCell>
                    <button
                      onClick={() => navigateToProductDetail(item.product.id)}
                      className="text-blue-500 hover:underline hover:cursor-pointer"
                    >
                      {item.product.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-red-500 font-medium">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {item.missingQuantity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => navigateToOrderDetail(item.order.id)}
                      className="text-blue-500 hover:underline hover:cursor-pointer"
                    >
                      {item.order.number}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => navigateToClientDetail(item.order.clientId)}
                      className="text-blue-500 hover:underline hover:cursor-pointer"
                    >
                      {item.clientName}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsufficientStockOrders;
