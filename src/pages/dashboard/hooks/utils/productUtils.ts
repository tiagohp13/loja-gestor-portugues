
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
 * Identifies products with stock levels at or below their minimum threshold
 */
export const identifyLowStockProducts = (products: Product[]): Product[] => {
  return products.filter(product => 
    product.currentStock <= product.minStock && product.minStock > 0
  );
};

/**
 * Calculates the quantity of each product sold
 */
export const calculateProductSales = (stockExits: StockExit[]): Record<string, number> => {
  return stockExits.flatMap(exit => exit.items).reduce((acc, item) => {
    const { productId, quantity } = item;
    if (!acc[productId]) {
      acc[productId] = 0;
    }
    acc[productId] += quantity;
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
  let mostSoldProductId = '';
  let mostSoldQuantity = 0;
  
  Object.entries(productSales).forEach(([productId, quantity]) => {
    if (quantity > mostSoldQuantity) {
      mostSoldProductId = productId;
      mostSoldQuantity = quantity;
    }
  });
  
  return products.find(p => p.id === mostSoldProductId);
};

/**
 * Calculates the total value of current stock
 */
export const calculateTotalStockValue = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + (product.currentStock * product.purchasePrice);
  }, 0);
};
