
import { StockExitItem } from '@/types';

export const useCalculations = (items: StockExitItem[]) => {
  const getDiscountedPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent) return price;
    return price * (1 - (discountPercent / 100));
  };
  
  const totalValue = items.reduce((sum, item) => {
    const discountedPrice = getDiscountedPrice(item.salePrice, item.discountPercent);
    return sum + (item.quantity * discountedPrice);
  }, 0);

  return {
    getDiscountedPrice,
    totalValue
  };
};
