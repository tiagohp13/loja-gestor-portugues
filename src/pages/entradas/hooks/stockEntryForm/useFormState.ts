
import { useState } from 'react';
import { StockEntryItem } from '@/types';
import { EntryDetails, CurrentItem } from './types';

export const useFormState = () => {
  const [entryDetails, setEntryDetails] = useState<EntryDetails>({
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });
  
  const [items, setItems] = useState<StockEntryItem[]>([]);
  
  const [currentItem, setCurrentItem] = useState<CurrentItem>({
    productId: '',
    productName: '',
    quantity: 1,
    purchasePrice: 0
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
