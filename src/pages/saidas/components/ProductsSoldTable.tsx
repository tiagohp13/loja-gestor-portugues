
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatting';
import ClickableProductItem from '@/components/common/ClickableProductItem';

type ProductsSoldTableProps = {
  items: any[];
  totalValue: number;
};

const ProductsSoldTable: React.FC<ProductsSoldTableProps> = ({
  items,
  totalValue
}) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Produtos Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
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
            {items && items.map((item: any) => (
              <ClickableProductItem
                key={item.id}
                id={item.id}
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
              <TableCell colSpan={3} className="text-right font-semibold">Total da Venda:</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(totalValue)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductsSoldTable;
