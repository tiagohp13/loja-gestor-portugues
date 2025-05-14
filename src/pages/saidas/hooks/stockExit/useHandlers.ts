
import { ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StockExitItem } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { ExitDetails } from './types';

interface UseHandlersProps {
  exitDetails: ExitDetails;
  setExitDetails: React.Dispatch<React.SetStateAction<ExitDetails>>;
  currentItem: StockExitItem;
  setCurrentItem: React.Dispatch<React.SetStateAction<StockExitItem>>;
  items: StockExitItem[];
  setItems: React.Dispatch<React.SetStateAction<StockExitItem[]>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProductDisplay: React.Dispatch<React.SetStateAction<string>>;
  setIsProductSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setClientSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setIsClientSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useHandlers = ({
  exitDetails,
  setExitDetails,
  currentItem,
  setCurrentItem,
  items,
  setItems,
  setSearchTerm,
  setSelectedProductDisplay,
  setIsProductSearchOpen,
  setClientSearchTerm,
  setIsClientSearchOpen
}: UseHandlersProps) => {
  
  const handleExitDetailsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExitDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value);
  };
  
  const handleProductSelect = (product: any) => {
    setCurrentItem({
      id: '',
      productId: product.id,
      productName: product.name,
      quantity: 1,
      salePrice: product.salePrice,
      discountPercent: 0
    });
    
    setSelectedProductDisplay(product.name);
    setSearchTerm('');
    setIsProductSearchOpen(false);
  };
  
  const handleClientSelect = (client: any) => {
    setExitDetails(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name
    }));
    
    setClientSearchTerm('');
    setIsClientSearchOpen(false);
  };
  
  const addItemToExit = () => {
    if (!currentItem.productId) {
      toast({ title: "Erro", description: "Selecione um produto" });
      return;
    }
    
    if (currentItem.quantity <= 0) {
      toast({ title: "Erro", description: "A quantidade deve ser maior que zero" });
      return;
    }
    
    if (currentItem.salePrice < 0) {
      toast({ title: "Erro", description: "O preço não pode ser negativo" });
      return;
    }
    
    setItems(prevItems => [...prevItems, { ...currentItem, id: uuidv4() }]);
    
    setCurrentItem({
      id: '',
      productId: '',
      productName: '',
      quantity: 1,
      salePrice: 0,
      discountPercent: 0
    });
    
    setSelectedProductDisplay('');
  };
  
  const removeItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, updatedItem: StockExitItem) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = updatedItem;
      return newItems;
    });
  };

  return {
    handleExitDetailsChange,
    handleSearch,
    handleClientSearch,
    handleProductSelect,
    handleClientSelect,
    addItemToExit,
    removeItem,
    updateItem
  };
};
