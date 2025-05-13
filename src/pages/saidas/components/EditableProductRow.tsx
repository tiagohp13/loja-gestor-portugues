
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Check, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { StockExitItem } from '@/types';

interface EditableProductRowProps {
  item: StockExitItem;
  index: number;
  removeItem: (index: number) => void;
  updateItem: (index: number, updatedItem: StockExitItem) => void;
  getDiscountedPrice: (price: number, discountPercent?: number) => number;
}

const EditableProductRow: React.FC<EditableProductRowProps> = ({ 
  item, 
  index, 
  removeItem, 
  updateItem,
  getDiscountedPrice
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<StockExitItem>(item);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedItem(item);
    setIsEditing(false);
  };
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateItem(index, editedItem);
    setIsEditing(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: string | number = value;
    if (name === 'quantity' || name === 'salePrice' || name === 'discountPercent') {
      parsedValue = value === '' ? 0 : Number(value);
    }
    
    setEditedItem(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  const originalPrice = item.salePrice;
  const finalPrice = getDiscountedPrice(item.salePrice, item.discountPercent);
  const subtotal = item.quantity * finalPrice;
  
  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3 text-sm">{item.productName}</td>
        <td className="px-4 py-3 text-sm">
          <Input
            type="number"
            name="quantity"
            value={editedItem.quantity}
            onChange={handleChange}
            className="w-20 h-8 text-sm"
            min="1"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            type="number"
            name="salePrice"
            value={editedItem.salePrice}
            onChange={handleChange}
            className="w-24 h-8 text-sm"
            step="0.01"
            min="0"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            type="number"
            name="discountPercent"
            value={editedItem.discountPercent || 0}
            onChange={handleChange}
            className="w-20 h-8 text-sm"
            step="1"
            min="0"
            max="100"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          {formatCurrency(getDiscountedPrice(editedItem.salePrice, editedItem.discountPercent) * editedItem.quantity)}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }
  
  return (
    <tr>
      <td className="px-4 py-3 text-sm">{item.productName}</td>
      <td className="px-4 py-3 text-sm">{item.quantity}</td>
      <td className="px-4 py-3 text-sm">
        {item.discountPercent && item.discountPercent > 0 ? (
          <div>
            <span className="line-through text-gray-500 mr-1">{formatCurrency(originalPrice)}</span>
            <span>{formatCurrency(finalPrice)}</span>
          </div>
        ) : (
          formatCurrency(finalPrice)
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {item.discountPercent ? `${item.discountPercent}%` : '-'}
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        {formatCurrency(subtotal)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => removeItem(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default EditableProductRow;
