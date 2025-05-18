
import { Product, StockEntry, StockExit } from '@/types';

/**
 * Creates category data for chart visualization
 */
export const createCategoryData = (products: Product[]): { name: string, quantidade: number }[] => {
  const categoryCounts = products.reduce((acc, product) => {
    const { category } = product;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categoryCounts).map(([category, count]) => ({
    name: category || 'Sem categoria',
    quantidade: count
  }));
};

/**
 * Identifies products with stock levels below their minimum threshold
 */
export const identifyLowStockProducts = (products: Product[]): Product[] => {
  return products.filter(product => 
    product.currentStock <= (product.minStock || 0) && product.minStock > 0
  );
};

/**
 * Calculates the quantity of each product sold
 * Fixed: Added null checking for items to prevent "Cannot destructure property 'productId' of 'item' as it is undefined"
 */
export const calculateProductSales = (stockExits: StockExit[]): Record<string, number> => {
  if (!stockExits || !Array.isArray(stockExits)) {
    return {};
  }
  
  return stockExits
    .filter(exit => exit && exit.items && Array.isArray(exit.items))
    .flatMap(exit => exit.items.filter(item => item !== undefined))
    .reduce((acc, item) => {
      if (!item) return acc;
      
      const { productId, quantity } = item;
      if (!productId) return acc;
      
      if (!acc[productId]) {
        acc[productId] = 0;
      }
      acc[productId] += quantity || 0;
      return acc;
    }, {} as Record<string, number>);
};

/**
 * Finds the most sold product based on quantity
 */
export const findMostSoldProduct = (
  productSales: Record<string, number>,
  products: Product[]
): Product | undefined => {
  if (!productSales || !products || !Array.isArray(products)) {
    return undefined;
  }
  
  let mostSoldProductId = '';
  let mostSoldQuantity = 0;
  
  Object.entries(productSales).forEach(([productId, quantity]) => {
    if (quantity > mostSoldQuantity) {
      mostSoldProductId = productId;
      mostSoldQuantity = quantity;
    }
  });
  
  return products.find(p => p && p.id === mostSoldProductId);
};

/**
 * Calculates the total value of current stock
 */
export const calculateTotalStockValue = (products: Product[]): number => {
  if (!products || !Array.isArray(products)) {
    return 0;
  }
  
  return products.reduce((total, product) => {
    if (!product) return total;
    return total + (product.currentStock * product.purchasePrice);
  }, 0);
};
