
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { StockEntryItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types';

interface StockEntryEditProductRowProps {
  item: StockEntryItem;
  index: number;
  products: Product[];
  onItemChange: (index: number, field: keyof StockEntryItem, value: any) => void;
  removeItem: (index: number) => void;
  calculateItemTotal: (item: StockEntryItem) => number;
}

const StockEntryEditProductRow: React.FC<StockEntryEditProductRowProps> = ({
  item,
  index,
  products,
  onItemChange,
  removeItem,
  calculateItemTotal
}) => {
  return (
    <tr>
      <td className="px-3 py-2">
        <Select
          value={item.productId || "placeholder"}
          onValueChange={(value) => onItemChange(index, 'productId', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder">Selecione um produto</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.code} - {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
          className="w-24"
        />
      </td>
      <td className="px-3 py-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.purchasePrice}
          onChange={(e) => onItemChange(index, 'purchasePrice', parseFloat(e.target.value) || 0)}
          className="w-24"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        {calculateItemTotal(item).toFixed(2)} €
      </td>
      <td className="px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeItem(index)}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </td>
    </tr>
  );
};

export default StockEntryEditProductRow;
