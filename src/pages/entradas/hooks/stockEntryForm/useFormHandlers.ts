
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { StockEntryFormState, EntryDetails } from './types';
import { Supplier, Product, StockEntryItem } from '@/types';

interface UseFormHandlersProps {
  entryDetails: EntryDetails;
  setEntryDetails: React.Dispatch<React.SetStateAction<EntryDetails>>;
  currentItem: StockEntryItem;
  setCurrentItem: React.Dispatch<React.SetStateAction<StockEntryItem>>;
  items: StockEntryItem[];
  setItems: React.Dispatch<React.SetStateAction<StockEntryItem[]>>;
  selectedProductDisplay: string;
  setSelectedProductDisplay: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setIsProductSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSupplierSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  products: Product[];
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

  const handleEntryDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntryDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (field: string, value: any) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    
    if (selectedProduct) {
      setCurrentItem({
        id: uuidv4(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        purchasePrice: selectedProduct.purchasePrice || 0,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const displayText = selectedProduct.code 
        ? `${selectedProduct.code} - ${selectedProduct.name}`
        : selectedProduct.name;
        
      setSelectedProductDisplay(displayText);
      setSearchTerm('');
      setIsProductSearchOpen(false);
    } else {
      console.error("Produto não encontrado com ID:", productId);
      toast.error("Não foi possível selecionar o produto. Tente novamente.");
    }
  };

  const addItemToEntry = () => {
    if (!currentItem.productId) {
      toast.error("Selecione um produto");
      return;
    }
    
    if (currentItem.quantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }
    
    if (currentItem.purchasePrice < 0) {
      toast.error("O preço não pode ser negativo");
      return;
    }
    
    const newItem: StockEntryItem = { 
      ...currentItem, 
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setItems(prevItems => [...prevItems, newItem]);
    
    setCurrentItem({
      id: uuidv4(),
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    setSelectedProductDisplay('');
  };

  const removeItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  return {
    handleEntryDetailsChange,
    handleItemChange,
    handleSearch,
    handleProductSelect,
    addItemToEntry,
    removeItem
  };
};
