
import { useState } from 'react';
import { StockEntryFormState } from './types';
import { StockEntryItem } from '@/types';

export const useEntryForm = (initialEntry: StockEntryFormState, setEntry: React.Dispatch<React.SetStateAction<StockEntryFormState>>) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSupplierChange = (value: string) => {
    // Não aceitar o valor "placeholder"
    if (value === "placeholder") return;
    
    setEntry(prev => ({
      ...prev,
      supplierId: value
    }));
  };

  const handleItemChange = (index: number, field: keyof StockEntryItem, value: any) => {
    const updatedItems = [...initialEntry.items];
    
    // Se o valor for "placeholder" para o campo productId, ignorar a alteração
    if (field === 'productId' && value === "placeholder") return;
    
    if (field === 'productId' && typeof value === 'string') {
      const selectedProduct = window.products?.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          productName: selectedProduct.name,
          purchasePrice: selectedProduct.purchasePrice || 0
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    
    setEntry(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addNewItem = () => {
    setEntry(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `temp-${Date.now()}`,
          productId: '', // Este valor vazio será substituído por "placeholder" na UI
          productName: '',
          quantity: 1,
          purchasePrice: 0,
          discountPercent: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = [...initialEntry.items];
    updatedItems.splice(index, 1);
    setEntry(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  return {
    handleChange,
    handleSupplierChange,
    handleItemChange,
    addNewItem,
    removeItem,
  };
};
