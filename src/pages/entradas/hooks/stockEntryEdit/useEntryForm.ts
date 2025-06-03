import { useState, useEffect } from 'react';
import { StockEntry, StockEntryItem } from '@/types';

interface StockEntryFormState {
  items: StockEntryItem[];
  supplierId: string;
  date: string;
  invoiceNumber: string;
  notes: string;
}

export const useEntryForm = (initialEntry: StockEntry | null) => {
  const [formState, setFormState] = useState<StockEntryFormState>({
    items: [],
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: '',
  });

  useEffect(() => {
    if (initialEntry) {
      setFormState({
        items: initialEntry.items,
        supplierId: initialEntry.supplierId,
        date: initialEntry.date,
        invoiceNumber: initialEntry.invoiceNumber || '',
        notes: initialEntry.notes || '',
      });
    }
  }, [initialEntry]);

  const updateItem = (index: number, field: keyof StockEntryItem, value: any) => {
    const updatedItems = [...formState.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setFormState(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const removeItem = (index: number) => {
    setFormState(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const addItem = () => {
    const newItem: StockEntryItem = {
      id: crypto.randomUUID(),
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormState(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const setSupplierId = (supplierId: string) => {
    setFormState(prev => ({
      ...prev,
      supplierId: supplierId,
    }));
  };

  const setDate = (date: string) => {
    setFormState(prev => ({
      ...prev,
      date: date,
    }));
  };

  const setInvoiceNumber = (invoiceNumber: string) => {
    setFormState(prev => ({
      ...prev,
      invoiceNumber: invoiceNumber,
    }));
  };

  const setNotes = (notes: string) => {
    setFormState(prev => ({
      ...prev,
      notes: notes,
    }));
  };

  return {
    formState,
    setFormState,
    updateItem,
    removeItem,
    addItem,
    setSupplierId,
    setDate,
    setInvoiceNumber,
    setNotes,
  };
};
