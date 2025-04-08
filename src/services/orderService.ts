import { v4 as uuidv4 } from 'uuid';
import { Order, StockExit } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique order number
export const generateOrderNumber = async (): Promise<string> => {
  try {
    // Try to get from Supabase function
    const { data, error } = await supabase.rpc('get_next_counter', { counter_id: 'orders' });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      return `ORD-${data}`;
    }
  } catch (error) {
    console.error('Error generating order number from Supabase:', error);
  }
  
  // Fallback to local generation
  const prefix = 'ORD';
  const randomNumber = Math.floor(Math.random() * 100000);
  const orderNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
  return orderNumber;
};

// Load orders from localStorage or create an empty array
const loadOrders = (): Order[] => {
  try {
    const ordersData = localStorage.getItem('orders');
    return ordersData ? JSON.parse(ordersData) : [];
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return [];
  }
};

// Save orders to localStorage
const saveOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem('orders', JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders to localStorage:', error);
  }
};

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  // First, try to get from localStorage
  const localOrders = loadOrders();
  
  try {
    // Try to fetch from Supabase
    const { data: ordersData, error: ordersError } = await supabase
      .from('Encomendas')
      .select('*')
      .order('createdat', { ascending: false });
    
    if (ordersError) {
      throw ordersError;
    }
    
    if (!ordersData) {
      return localOrders;
    }
    
    // Transform the returned data
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        // Fetch items for each order
        const { data: itemsData, error: itemsError } = await supabase
          .from('EncomendasItems')
          .select('*')
          .eq('encomendaid', order.id);
        
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          return {
            id: order.id,
            clientId: order.clientid,
            clientName: order.clientname,
            orderNumber: order.ordernumber,
            date: order.date,
            notes: order.notes,
            status: (order.status as "pending" | "completed" | "cancelled"),
            discount: order.discount || 0,
            convertedToStockExitId: order.convertedtostockexitid,
            createdAt: order.createdat,
            updatedAt: order.updatedat,
            items: []
          } as Order;
        }
        
        // Map items to the expected format
        const mappedItems = (itemsData || []).map(item => ({
          productId: item.productid,
          productName: item.productname,
          quantity: item.quantity,
          salePrice: item.saleprice,
          discount: item.discount || 0
        }));
        
        // Return the order with its mapped items
        return {
          id: order.id,
          clientId: order.clientid,
          clientName: order.clientname,
          orderNumber: order.ordernumber,
          date: order.date,
          notes: order.notes,
          status: (order.status as "pending" | "completed" | "cancelled"),
          discount: order.discount || 0,
          convertedToStockExitId: order.convertedtostockexitid,
          createdAt: order.createdat,
          updatedAt: order.updatedat,
          items: mappedItems
        } as Order;
      })
    );
    
    // Save to localStorage for offline use
    saveOrders(ordersWithItems);
    
    return ordersWithItems;
  } catch (error) {
    console.error('Error fetching orders from Supabase:', error);
    // Return localStorage data as fallback
    return localOrders;
  }
};

// Add a new order
export const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderNumber'>): Promise<Order> => {
  const orderNumber = await generateOrderNumber();
  
  const newOrder: Order = {
    id: uuidv4(),
    ...order,
    orderNumber: orderNumber,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // Save to Supabase
    const { error } = await supabase
      .from('Encomendas')
      .insert({
        id: newOrder.id,
        ordernumber: newOrder.orderNumber,
        clientid: newOrder.clientId,
        clientname: newOrder.clientName,
        date: newOrder.date,
        notes: newOrder.notes,
        status: newOrder.status,
        discount: newOrder.discount,
        createdat: newOrder.createdAt,
        updatedat: newOrder.updatedAt
      });
    
    if (error) {
      console.error('Error saving order to Supabase:', error);
      throw error;
    }
    
    // Insert order items
    if (newOrder.items && newOrder.items.length > 0) {
      const orderItems = newOrder.items.map(item => ({
        encomendaid: newOrder.id,
        productid: item.productId,
        productname: item.productName,
        quantity: item.quantity,
        saleprice: item.salePrice,
        discount: item.discount || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('EncomendasItems')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error saving order items to Supabase:', itemsError);
        // Continue even with errors to save other items
      }
    }
  } catch (error) {
    console.error('Error adding order:', error);
    // Continue with local save even if Supabase fails
  }
  
  // Update localStorage
  const orders = loadOrders();
  saveOrders([newOrder, ...orders]);
  
  return newOrder;
};

// Update an order
export const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order> => {
  const orders = loadOrders();
  const orderIndex = orders.findIndex(order => order.id === id);
  
  if (orderIndex === -1) {
    throw new Error(`Order with id ${id} not found`);
  }
  
  const updatedOrder = {
    ...orders[orderIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  orders[orderIndex] = updatedOrder;
  
  try {
    // Update in Supabase
    const { error } = await supabase
      .from('Encomendas')
      .update({
        clientid: updatedOrder.clientId,
        clientname: updatedOrder.clientName,
        date: updatedOrder.date,
        notes: updatedOrder.notes,
        status: updatedOrder.status,
        discount: updatedOrder.discount,
        updatedat: updatedOrder.updatedAt,
        convertedtostockexitid: updatedOrder.convertedToStockExitId
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating order in Supabase:', error);
      throw error;
    }
    
    // If items were updated, delete old items and insert new ones
    if (updates.items) {
      // First delete existing items
      const { error: deleteError } = await supabase
        .from('EncomendasItems')
        .delete()
        .eq('encomendaid', id);
      
      if (deleteError) {
        console.error('Error deleting order items from Supabase:', deleteError);
      }
      
      // Then insert new items
      const orderItems = updatedOrder.items.map(item => ({
        encomendaid: updatedOrder.id,
        productid: item.productId,
        productname: item.productName,
        quantity: item.quantity,
        saleprice: item.salePrice,
        discount: item.discount || 0
      }));
      
      const { error: insertError } = await supabase
        .from('EncomendasItems')
        .insert(orderItems);
      
      if (insertError) {
        console.error('Error inserting updated order items to Supabase:', insertError);
      }
    }
  } catch (error) {
    console.error('Error updating order:', error);
    // Continue with local update even if Supabase fails
  }
  
  // Save to localStorage
  saveOrders(orders);
  
  return updatedOrder;
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  const orders = loadOrders();
  const filteredOrders = orders.filter(order => order.id !== id);
  
  try {
    // Delete items first
    const { error: itemsError } = await supabase
      .from('EncomendasItems')
      .delete()
      .eq('encomendaid', id);
    
    if (itemsError) {
      console.error('Error deleting order items from Supabase:', itemsError);
    }
    
    // Then delete order
    const { error } = await supabase
      .from('Encomendas')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting order from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    // Continue with local delete even if Supabase fails
  }
  
  // Save to localStorage
  saveOrders(filteredOrders);
};

// Find an order by ID
export const findOrder = (id: string, orders: Order[]): Order | undefined => {
  return orders.find(order => order.id === id);
};

// Convert an order to a stock exit
export const convertOrderToStockExit = async (
  orderId: string, 
  orders: Order[], 
  addStockExit: (exit: Omit<StockExit, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'exitNumber'>) => Promise<StockExit>
): Promise<void> => {
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    throw new Error(`Order with id ${orderId} not found`);
  }
  
  // Create a new stock exit from the order
  const stockExit = await addStockExit({
    clientId: order.clientId,
    clientName: order.clientName,
    reason: `Encomenda ${order.orderNumber}`,
    items: order.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      salePrice: item.salePrice,
      discount: item.discount || 0
    })),
    date: new Date().toISOString(),
    notes: order.notes,
    discount: order.discount,
    fromOrderId: order.id
  });
  
  // Update the order to mark it as converted
  await updateOrder(order.id, { 
    status: 'completed', 
    convertedToStockExitId: stockExit.id 
  });
};
