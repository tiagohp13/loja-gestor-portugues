
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { OrderItem } from '../hooks/order-form/types';

interface OrderProductsTableProps {
  orderItems: OrderItem[];
  handleRemoveProduct: (index: number) => void;
  handleUpdateItem: (index: number, field: 'quantity' | 'salePrice', value: number) => void;
  calculateTotal: () => number;
}

const OrderProductsTable: React.FC<OrderProductsTableProps> = React.memo(({
  orderItems,
  handleRemoveProduct,
  handleUpdateItem,
  calculateTotal
}) => {
  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {orderItems.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                Nenhum produto adicionado
              </td>
            </tr>
          ) : (
            orderItems.map((item, index) => (
              <tr key={item.productId || `order-item-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.salePrice}
                    onChange={(e) => handleUpdateItem(index, 'salePrice', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-blue font-medium">
                  {formatCurrency(item.quantity * item.salePrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
              Total
            </td>
            <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
              {formatCurrency(calculateTotal())}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

export default OrderProductsTable;
