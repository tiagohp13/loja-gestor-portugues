
import { useProductsQuery } from '@/hooks/queries/useProducts';
import { useSuppliersQuery } from '@/hooks/queries/useSuppliers';
import { useStockEntriesQuery } from '@/hooks/queries/useStockEntries';
import { useEntryFetch } from './stockEntryEdit/useEntryFetch';
import { useEntryForm } from './stockEntryEdit/useEntryForm';
import { useEntrySubmit } from './stockEntryEdit/useEntrySubmit';
import { calculateItemTotal, calculateTotal } from './stockEntryEdit/utils';
import { StockEntryItem } from '@/types';
import { UseStockEntryEditReturn } from './stockEntryEdit/types';

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
  const { products } = useProductsQuery();
  const { suppliers } = useSuppliersQuery();
  const { stockEntries } = useStockEntriesQuery();
  
  // Fetch entry data from API
  const { entry, setEntry } = useEntryFetch(id);
  
  // Form management hooks
  const { 
    handleChange, 
    handleSupplierChange, 
    handleItemChange, 
    addNewItem, 
    removeItem 
  } = useEntryForm({ entry, setEntry, suppliers });
  
  // Form submission
  const { handleSubmit, isSubmitting, isNewEntry } = useEntrySubmit(id, entry, suppliers, stockEntries);

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
