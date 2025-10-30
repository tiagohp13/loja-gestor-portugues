
import { StockEntryFormState, UseEntryFormProps } from './types';
import { StockEntryItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useEntryForm = ({ entry, setEntry, suppliers }: UseEntryFormProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (value: string) => {
    const supplier = suppliers?.find(s => s.id === value);
    setEntry(prev => ({
      ...prev,
      supplierId: value
    }));
  };

  const handleItemChange = (index: number, field: keyof StockEntryItem, value: any) => {
    setEntry(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { ...item, [field]: value, updatedAt: new Date().toISOString() }
          : item
      )
    }));
  };

  const addNewItem = () => {
    const newItem: StockEntryItem = {
      id: uuidv4(),
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEntry(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    setEntry(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  return {
    handleChange,
    handleSupplierChange,
    handleItemChange,
    addNewItem,
    removeItem
  };
};
