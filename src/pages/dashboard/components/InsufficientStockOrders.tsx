
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, Order, OrderItem } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

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

type SortField = 'order' | 'date' | 'product' | 'missingQuantity' | 'client';
type SortDirection = 'asc' | 'desc';

const InsufficientStockOrders: React.FC<InsufficientStockOrdersProps> = ({
  insufficientItems,
  navigateToProductDetail,
  navigateToOrderDetail,
  navigateToClientDetail,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort direction if clicking on same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default direction
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const sortedItems = [...insufficientItems].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'order':
        return multiplier * a.order.number.localeCompare(b.order.number);
      case 'date':
        return multiplier * (new Date(a.order.date).getTime() - new Date(b.order.date).getTime());
      case 'product':
        return multiplier * a.product.name.localeCompare(b.product.name);
      case 'missingQuantity':
        return multiplier * (a.missingQuantity - b.missingQuantity);
      case 'client':
        return multiplier * a.clientName.localeCompare(b.clientName);
      default:
        return 0;
    }
  });

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
                <TableHead 
                  onClick={() => handleSort('order')} 
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Encomenda {getSortIcon('order')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('date')} 
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Data {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('product')} 
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Produto {getSortIcon('product')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('missingQuantity')} 
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Falta Comprar {getSortIcon('missingQuantity')}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('client')} 
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Cliente {getSortIcon('client')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item, index) => (
                <TableRow key={`${item.order.id}-${item.product.id}-${index}`}>
                  <TableCell>
                    <button
                      onClick={() => navigateToOrderDetail(item.order.id)}
                      className="text-blue-500 hover:underline hover:cursor-pointer"
                    >
                      {item.order.number}
                    </button>
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.order.date), "dd/MM/yyyy", { locale: pt })}
                  </TableCell>
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
