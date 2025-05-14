
import { useMemo } from 'react';
import { StockEntryItem } from '@/types';

export const useCalculations = (items: StockEntryItem[]) => {
  const totalValue = useMemo(() => {
    return items.reduce((total, item) => 
      total + (item.quantity * item.purchasePrice), 0);
  }, [items]);

  return { totalValue };
};
