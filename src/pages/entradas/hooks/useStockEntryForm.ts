
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useFormState } from './stockEntryForm/useFormState';
import { useFormHandlers } from './stockEntryForm/useFormHandlers';
import { useFilters } from './stockEntryForm/useFilters';
import { useSupplierSelect } from './stockEntryForm/useSupplierSelect';
import { useSubmit } from './stockEntryForm/useSubmit';
import { useCalculations } from './stockEntryForm/useCalculations';
import { UseStockEntryFormReturn } from './stockEntryForm/types';

interface UseStockEntryFormProps {
  entryId?: string; // Add entryId parameter for editing
}

export const useStockEntryForm = (props?: UseStockEntryFormProps): UseStockEntryFormReturn => {
  const { addStockEntry, products, suppliers, stockEntries, updateStockEntry } = useData();
  const entryId = props?.entryId;
  
  const {
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
  } = useFormState();
  
  // Load entry data when editing
  React.useEffect(() => {
    if (entryId) {
      const existingEntry = stockEntries.find(entry => entry.id === entryId);
      if (existingEntry) {
        setEntryDetails({
          id: existingEntry.id,
          supplierId: existingEntry.supplierId,
          supplierName: existingEntry.supplierName,
          date: existingEntry.date ? new Date(existingEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          invoiceNumber: existingEntry.invoiceNumber || '',
          notes: existingEntry.notes || ''
        });
        setItems(existingEntry.items || []);
        setEntryDate(new Date(existingEntry.date));
      }
    }
  }, [entryId, stockEntries, setEntryDetails, setItems, setEntryDate]);
  
  const {
    handleEntryDetailsChange,
    handleItemChange,
    handleSearch,
    handleProductSelect,
    addItemToEntry,
    removeItem
  } = useFormHandlers({
    entryDetails,
    setEntryDetails,
    currentItem,
    setCurrentItem,
    items,
    setItems,
    selectedProductDisplay,
    setSelectedProductDisplay,
    setSearchTerm,
    setIsProductSearchOpen,
    setIsSupplierSearchOpen,
    products
  });
  
  const { handleSupplierSearch, handleSupplierSelect } = useSupplierSelect(
    setEntryDetails,
    setIsSupplierSearchOpen,
    suppliers
  );
  
  const { filteredProducts, filteredSuppliers } = useFilters({
    searchTerm,
    supplierSearchTerm,
    products,
    suppliers
  });
  
  const { totalValue } = useCalculations(items);
  
  const { handleSubmit, isSubmitting } = useSubmit({
    entryDetails,
    items,
    entryDate,
    suppliers,
    addStockEntry: (entry) => {
      const stockEntryData = {
        ...entry,
        updatedAt: new Date().toISOString()
      };
      return addStockEntry(stockEntryData);
    },
    updateStockEntry
  });

  return {
    entryDetails,
    items,
    currentItem,
    searchTerm,
    selectedProductDisplay,
    isProductSearchOpen,
    isSupplierSearchOpen,
    supplierSearchTerm,
    entryDate,
    calendarOpen,
    filteredProducts,
    filteredSuppliers,
    totalValue,
    isSubmitting,
    setEntryDetails,
    setItems, // Now included in return
    setCurrentItem,
    setSearchTerm,
    setSelectedProductDisplay,
    setIsProductSearchOpen,
    setIsSupplierSearchOpen,
    setSupplierSearchTerm,
    setCalendarOpen,
    setEntryDate,
    handleEntryDetailsChange,
    handleItemChange,
    handleSearch,
    handleSupplierSearch,
    handleProductSelect,
    handleSupplierSelect,
    addItemToEntry,
    removeItem,
    handleSubmit
  };
};
