
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { StockExitItem } from '@/types';

interface ProductsTableProps {
  items: StockExitItem[];
  removeItem: (index: number) => void;
  getDiscountedPrice: (price: number, discountPercent: number) => number;
  totalValue: number;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  items,
  removeItem,
  getDiscountedPrice,
  totalValue
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Nenhum produto adicionado
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const discountedPrice = getDiscountedPrice(item.salePrice, item.discountPercent || 0);
              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.salePrice.toFixed(2)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.discountPercent ? `${item.discountPercent}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{(item.quantity * discountedPrice).toFixed(2)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Total
            </td>
            <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
              {totalValue.toFixed(2)} €
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ProductsTable;
