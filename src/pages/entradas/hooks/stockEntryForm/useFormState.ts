
import { useState } from 'react';
import { StockEntryItem } from '@/types';
import { EntryDetails } from './types';

export const useFormState = () => {
  const [entryDetails, setEntryDetails] = useState<EntryDetails>({
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });
  
  const [items, setItems] = useState<StockEntryItem[]>([]);
  
  // Initialize currentItem with all required StockEntryItem fields
  const [currentItem, setCurrentItem] = useState<StockEntryItem>({
    id: '',
    productId: '',
    productName: '',
    quantity: 1,
    purchasePrice: 0,
    discountPercent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isSupplierSearchOpen, setIsSupplierSearchOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  return {
    entryDetails,
    setEntryDetails,
    items,
    setItems,
    currentItem,
    setCurrentItem,
    searchTerm,
    setSearchTerm,
    selectedProductDisplay,
    setSelectedProductDisplay,
    isProductSearchOpen,
    setIsProductSearchOpen,
    isSupplierSearchOpen,
    setIsSupplierSearchOpen,
    supplierSearchTerm,
    setSupplierSearchTerm,
    entryDate,
    setEntryDate,
    calendarOpen,
    setCalendarOpen
  };
};
