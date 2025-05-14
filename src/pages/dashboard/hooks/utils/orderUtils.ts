
import { Product, Order, OrderItem } from '@/types';

/**
 * Identifies orders with insufficient stock
 * @param orders List of all orders
 * @param products List of all products
 * @returns Array of order items with insufficient stock details
 */
export const findInsufficientStockOrders = (
  orders: Order[],
  products: Product[]
) => {
  // Get only pending orders (not converted to stock exit)
  const pendingOrders = orders.filter(order => !order.convertedToStockExitId);
  
  // Create result array
  const insufficientItems: Array<{
    product: Product;
    order: Order;
    clientName: string;
    missingQuantity: number;
    orderItem: OrderItem;
  }> = [];
  
  // Check each pending order
  pendingOrders.forEach(order => {
    if (!order.items || order.items.length === 0) return;
    
    // Check each item in the order
    order.items.forEach(item => {
      // Find the product
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      // Calculate missing quantity
      const missingQuantity = item.quantity - product.currentStock;
      
      // If missing quantity is greater than 0, add to result
      if (missingQuantity > 0) {
        insufficientItems.push({
          product,
          order,
          clientName: order.clientName || 'Cliente desconhecido',
          missingQuantity,
          orderItem: item
        });
      }
    });
  });
  
  // Sort by date (newest first)
  return insufficientItems.sort((a, b) => 
    new Date(b.order.date).getTime() - new Date(a.order.date).getTime()
  );
};
