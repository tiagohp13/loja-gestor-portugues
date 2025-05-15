
import { useState, useEffect } from 'react';
import { StockExit } from '@/types';
import { ExitDetails, ExitItem, UseExitStateReturn } from './types';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';

export const useExitState = (exitId?: string): UseExitStateReturn => {
  const { stockExits } = useData();
  
  const initialExitDetails: ExitDetails = {
    clientId: '',
    clientName: '',
    invoiceNumber: '',
    notes: '',
    discount: 0,
  };
  
  const [exitDetails, setExitDetails] = useState<ExitDetails>(initialExitDetails);
  const [items, setItems] = useState<ExitItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ExitItem>({
    id: uuidv4(),
    productId: '',
    productName: '',
    quantity: 1,
    salePrice: 0,
    discountPercent: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [exitDate, setExitDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Load exit data if in edit mode
  useEffect(() => {
    if (exitId) {
      const exitData = stockExits.find(exit => exit.id === exitId);
      
      if (exitData) {
        setExitDetails({
          clientId: exitData.clientId || '',
          clientName: exitData.clientName || '',
          invoiceNumber: exitData.invoiceNumber || '',
          notes: exitData.notes || '',
          discount: exitData.discount || 0,
        });
        
        // Ensure we have an id in each item
        const itemsWithId = exitData.items.map(item => ({
          ...item,
          id: item.id || uuidv4()
        }));
        
        setItems(itemsWithId);
        setExitDate(new Date(exitData.date));
      }
    }
  }, [exitId, stockExits]);

  return {
    exitDetails,
    items,
    currentItem,
    searchTerm,
    clientSearchTerm,
    selectedProductDisplay,
    isProductSearchOpen,
    isClientSearchOpen,
    exitDate,
    calendarOpen,
    setExitDetails,
    setItems,
    setCurrentItem,
    setSearchTerm,
    setClientSearchTerm,
    setSelectedProductDisplay,
    setIsProductSearchOpen,
    setIsClientSearchOpen,
    setExitDate,
    setCalendarOpen
  };
};
