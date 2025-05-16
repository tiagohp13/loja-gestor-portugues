
import { StockEntryItem } from '@/types';
import { CurrentItem, EntryDetails } from './types';
import { toast } from 'sonner';

interface UseFormHandlersProps {
  entryDetails: EntryDetails;
  setEntryDetails: React.Dispatch<React.SetStateAction<EntryDetails>>;
  currentItem: CurrentItem;
  setCurrentItem: React.Dispatch<React.SetStateAction<CurrentItem>>;
  items: StockEntryItem[];
  setItems: React.Dispatch<React.SetStateAction<StockEntryItem[]>>;
  selectedProductDisplay: string;
  setSelectedProductDisplay: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setIsProductSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSupplierSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  products: Array<{
    id: string;
    name: string;
    code: string;
    currentStock: number;
    purchasePrice: number;
  }>;
}

export const useFormHandlers = ({
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
}: UseFormHandlersProps) => {
  
  const handleEntryDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'purchasePrice' 
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSupplierSearch = (value: string) => {
    // This will be used in the useFilters hook
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setCurrentItem({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        purchasePrice: selectedProduct.purchasePrice
      });
      setSelectedProductDisplay(`${selectedProduct.code} - ${selectedProduct.name}`);
    }
    setIsProductSearchOpen(false);
  };
  
  const handleSupplierSelect = (supplierId: string) => {
    // This will be implemented in the useSupplierSelect hook
  };
  
  const addItemToEntry = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Selecione um produto e uma quantidade válida');
      return;
    }
    
    const existingItemIndex = items.findIndex(item => item.productId === currentItem.productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + currentItem.quantity,
        purchasePrice: currentItem.purchasePrice
      };
      setItems(updatedItems);
    } else {
      setItems([...items, { 
        id: crypto.randomUUID(),
        ...currentItem 
      }]);
    }
    
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0
    });
    setSelectedProductDisplay('');
    setSearchTerm('');
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return {
    handleEntryDetailsChange,
    handleItemChange,
    handleSearch,
    handleProductSelect,
    addItemToEntry,
    removeItem,
  };
};
