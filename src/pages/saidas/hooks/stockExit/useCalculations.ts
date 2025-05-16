
import { useMemo } from 'react';
import { StockExitItem } from '@/types';

export const useCalculations = (items: StockExitItem[]) => {
  const totalValue = useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.salePrice;
      const discountPercent = item.discountPercent || 0;
      const discountedPrice = price - (price * discountPercent / 100);
      
      return total + (item.quantity * discountedPrice);
    }, 0);
  }, [items]);
  
  return { 
    totalValue
  };
};
