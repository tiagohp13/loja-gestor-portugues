
import React from 'react';
import { StockExitItem } from '@/types';
import { formatCurrency } from '@/utils/formatting';
import EditableProductRow from './EditableProductRow';

interface ProductsTableProps {
  items: StockExitItem[];
  removeItem: (index: number) => void;
  updateItem: (index: number, updatedItem: StockExitItem) => void;
  getDiscountedPrice: (price: number, discountPercent?: number) => number;
  totalValue: number;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  items,
  removeItem,
  updateItem,
  getDiscountedPrice,
  totalValue
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-gray-50 mt-4">
        <p className="text-gray-500">Nenhum produto adicionado</p>
        <p className="text-sm text-gray-400 mt-1">Adicione produtos à venda utilizando o formulário acima</p>
      </div>
    );
  }

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="min-w-full border rounded-md overflow-hidden">
        <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Produto</th>
            <th className="px-4 py-3 text-left">Qtd</th>
            <th className="px-4 py-3 text-left">Preço</th>
            <th className="px-4 py-3 text-left">Desc.</th>
            <th className="px-4 py-3 text-left">Subtotal</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <EditableProductRow
              key={index}
              item={item}
              index={index}
              removeItem={removeItem}
              updateItem={updateItem}
              getDiscountedPrice={getDiscountedPrice}
            />
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-medium">
          <tr>
            <td colSpan={4} className="px-4 py-3 text-sm text-right">Total:</td>
            <td colSpan={2} className="px-4 py-3 text-sm text-left font-bold">
              {formatCurrency(totalValue)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ProductsTable;
