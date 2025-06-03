
import { useData } from '@/contexts/DataContext';
import { useFormState } from './stockEntryForm/useFormState';
import { useFormHandlers } from './stockEntryForm/useFormHandlers';
import { useFilters } from './stockEntryForm/useFilters';
import { useSupplierSelect } from './stockEntryForm/useSupplierSelect';
import { useSubmit } from './stockEntryForm/useSubmit';
import { useCalculations } from './stockEntryForm/useCalculations';
import { UseStockEntryFormReturn } from './stockEntryForm/types';

export const useStockEntryForm = (): UseStockEntryFormReturn => {
  const { addStockEntry, products, suppliers } = useData();
  
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
  
  // Fix type compatibility by ensuring entry has all required fields
  const { handleSubmit, isSubmitting } = useSubmit({
    entryDetails: {
      ...entryDetails,
      updatedAt: new Date().toISOString() // Add required field
    },
    items,
    entryDate,
    suppliers,
    addStockEntry: (entry: any) => addStockEntry({
      ...entry,
      updatedAt: new Date().toISOString() // Ensure updatedAt is present
    })
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
