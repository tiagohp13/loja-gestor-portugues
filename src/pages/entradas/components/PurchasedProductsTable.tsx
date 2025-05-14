
import React from 'react';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClickableProductItem from '@/components/common/ClickableProductItem';
import { formatCurrency } from '@/utils/formatting';

type ProductItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
};

type PurchasedProductsTableProps = {
  items: ProductItem[];
  totalValue: number;
};

const PurchasedProductsTable: React.FC<PurchasedProductsTableProps> = ({ items, totalValue }) => {
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
        {items && items.map((item) => (
          <ClickableProductItem
            key={item.id}
            id={item.id}
            productId={item.productId}
            name={item.productName}
            quantity={item.quantity}
            price={item.purchasePrice}
            total={item.quantity * item.purchasePrice}
          />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-semibold">Total da Compra:</TableCell>
          <TableCell className="text-right font-semibold">{formatCurrency(totalValue)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default PurchasedProductsTable;
