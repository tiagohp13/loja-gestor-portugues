
import { useData } from '@/contexts/DataContext';
import { useEntryFetch } from './stockEntryEdit/useEntryFetch';
import { useEntryForm } from './stockEntryEdit/useEntryForm';
import { useEntrySubmit } from './stockEntryEdit/useEntrySubmit';
import { calculateItemTotal, calculateTotal } from './stockEntryEdit/utils';
import { StockEntryItem } from '@/types';
import { UseStockEntryEditProps, UseStockEntryEditReturn } from './stockEntryEdit/types';

// Make product and suppliers data available to other hooks via window object
// This avoids circular dependencies
declare global {
  interface Window {
    products: any[];
    suppliers: any[];
    stockEntries: any[];
  }
}

export const useStockEntryEdit = (id?: string): UseStockEntryEditReturn => {
  const { products, suppliers, stockEntries } = useData();
  
  // Store these in window so other hooks can access them without circular deps
  window.products = products;
  window.suppliers = suppliers;
  window.stockEntries = stockEntries;
  
  // Fetch entry data from API
  const { entry, setEntry } = useEntryFetch(id);
  
  // Form management hooks
  const { 
    handleChange, 
    handleSupplierChange, 
    handleItemChange, 
    addNewItem, 
    removeItem 
  } = useEntryForm(entry, setEntry);
  
  // Form submission
  const { handleSubmit, isSubmitting, isNewEntry } = useEntrySubmit(id, entry);

  return {
    entry,
    isNewEntry,
    isSubmitting,
    handleChange,
    handleSupplierChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleSubmit,
    calculateItemTotal: (item: StockEntryItem) => calculateItemTotal(item),
    calculateTotal: () => calculateTotal(entry.items),
  };
};
