
import React from 'react';
import { formatCurrency } from '@/utils/formatting';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClickableProductItem from '@/components/common/ClickableProductItem';
import { OrderItem } from '@/types';

interface OrderProductsTableDetailProps {
  items: OrderItem[];
  totalValue: number;
}

const OrderProductsTableDetail: React.FC<OrderProductsTableDetailProps> = ({ items, totalValue }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead className="text-center">Quantidade</TableHead>
          <TableHead className="text-right">Preço Unit.</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items && items.map((item, index) => (
          <ClickableProductItem
            key={`order-item-${index}-${item.productId}`}
            id={`order-item-${index}`}
            productId={item.productId}
            name={item.productName}
            quantity={item.quantity}
            price={item.salePrice}
            total={item.quantity * item.salePrice}
          />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-semibold">Total da Encomenda:</TableCell>
          <TableCell className="text-right font-semibold">{formatCurrency(totalValue)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default OrderProductsTableDetail;
