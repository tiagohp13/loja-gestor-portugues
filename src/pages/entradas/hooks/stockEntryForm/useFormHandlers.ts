import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import { StockEntryFormState } from './useStockEntryForm';
import { Supplier, Product, StockEntryItem } from '@/types';

export const useFormHandlers = (
  formState: StockEntryFormState,
  setFormState: React.Dispatch<React.SetStateAction<StockEntryFormState>>,
  suppliers: Supplier[],
  products: Product[]
) => {
  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setFormState(prev => ({
      ...prev,
      supplierId: supplierId,
      supplierName: supplier?.name || ''
    }));
  };

  const handleDateChange = (date: string) => {
    setFormState(prev => ({ ...prev, date: date }));
  };

  const handleInvoiceNumberChange = (invoiceNumber: string) => {
    setFormState(prev => ({ ...prev, invoiceNumber: invoiceNumber }));
  };

  const handleNotesChange = (notes: string) => {
    setFormState(prev => ({ ...prev, notes: notes }));
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    setFormState(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], quantity: quantity };
      return { ...prev, items: newItems };
    });
  };

  const handleItemPurchasePriceChange = (index: number, purchasePrice: number) => {
    setFormState(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], purchasePrice: purchasePrice };
      return { ...prev, items: newItems };
    });
  };

  const handleItemDiscountPercentChange = (index: number, discountPercent: number) => {
    setFormState(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], discountPercent: discountPercent };
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setFormState(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newItem: StockEntryItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      purchasePrice: product.purchasePrice,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormState(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  return {
    handleSupplierChange,
    handleDateChange,
    handleInvoiceNumberChange,
    handleNotesChange,
    handleItemQuantityChange,
    handleItemPurchasePriceChange,
    handleItemDiscountPercentChange,
    removeItem,
    addProduct
  };
};
