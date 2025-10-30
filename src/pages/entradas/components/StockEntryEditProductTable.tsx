
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StockEntryItem } from '@/types';
import { Product } from '@/types';
import StockEntryEditProductRow from './StockEntryEditProductRow';

interface StockEntryEditProductTableProps {
  items: StockEntryItem[];
  products: Product[];
  onItemChange: (index: number, field: keyof StockEntryItem, value: any) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  calculateItemTotal: (item: StockEntryItem) => number;
  calculateTotal: () => number;
}

const StockEntryEditProductTable: React.FC<StockEntryEditProductTableProps> = ({
  items,
  products,
  onItemChange,
  addNewItem,
  removeItem,
  calculateItemTotal,
  calculateTotal
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gestorApp-gray-dark">
          Produtos
        </label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={addNewItem}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                Produto
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                Preço Unitário
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {items.map((item, index) => (
              <StockEntryEditProductRow
                key={index}
                item={item}
                index={index}
                products={products}
                onItemChange={onItemChange}
                removeItem={removeItem}
                calculateItemTotal={calculateItemTotal}
              />
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right font-medium">
                Total:
              </td>
              <td className="px-3 py-2 font-medium">
                {calculateTotal().toFixed(2)} €
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default StockEntryEditProductTable;
