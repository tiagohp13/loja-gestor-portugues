
import { useStock } from '@/contexts/StockContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useSuppliers } from '@/contexts/SuppliersContext';
import { useFormState } from './stockEntryForm/useFormState';
import { useFormHandlers } from './stockEntryForm/useFormHandlers';
import { useFilters } from './stockEntryForm/useFilters';
import { useSupplierSelect } from './stockEntryForm/useSupplierSelect';
import { useSubmit } from './stockEntryForm/useSubmit';
import { useCalculations } from './stockEntryForm/useCalculations';
import { UseStockEntryFormReturn } from './stockEntryForm/types';

export const useStockEntryForm = (): UseStockEntryFormReturn => {
  const { addStockEntry } = useStock();
  const { products } = useProducts();
  const { suppliers } = useSuppliers();
  
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
  
  // Fix type compatibility by creating the entry object with proper typing
  const { handleSubmit, isSubmitting } = useSubmit({
    entryDetails,
    items,
    entryDate,
    suppliers,
    addStockEntry: (entry) => {
      // Ensure the entry has all required fields for StockEntry
      const stockEntryData = {
        ...entry,
        updatedAt: new Date().toISOString()
      };
      return addStockEntry(stockEntryData);
    }
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
