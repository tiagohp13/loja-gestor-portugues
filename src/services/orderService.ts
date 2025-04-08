
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique order number
export async function generateOrderNumber(): Promise<string> {
  const prefix = 'ORD';
  const randomNumber = Math.floor(Math.random() * 100000);
  const orderNumber = `${prefix}-${randomNumber.toString().padStart(5, '0')}`;
  return orderNumber;
}

// Fetch all orders from Supabase
export async function fetchOrders(): Promise<Order[]> {
  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('Encomendas')
      .select('*')
      .order('createdat', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    if (!ordersData) {
      throw new Error("No orders found");
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
            discount: 0, // Setting default discount to 0 instead of using order.discount
            convertedToStockExitId: order.convertedtostockexitid,
            createdAt: order.createdat,
            updatedAt: order.updatedat,
            items: []
          } as Order;
        }

        // Map items to the expected format in OrderItem[]
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
          discount: 0, // Setting default discount to 0 instead of using order.discount
          convertedToStockExitId: order.convertedtostockexitid,
          createdAt: order.createdat,
          updatedAt: order.updatedat,
          items: mappedItems
        } as Order;
      })
    );
      
    return ordersWithItems;
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

// Create a new order
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderNumber'>): Promise<Order | null> {
  try {
    const orderNumber = await generateOrderNumber();
    
    const newOrder: Order = {
      id: uuidv4(),
      ...orderData,
      orderNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      discount: 0 // Setting fixed discount to 0
    };
    
    // Insert order data
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
        discount: 0, // Setting fixed discount to 0
        createdat: newOrder.createdAt,
        updatedat: newOrder.updatedAt
      });
    
    if (error) {
      console.error('Error creating order:', error);
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
        console.error('Error creating order items:', itemsError);
        // Continue even with errors to save other items
      }
    }
    
    return newOrder;
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
}

// Update an existing order
export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  try {
    // First, update the Encomendas table
    const { error } = await supabase
      .from('Encomendas')
      .update({
        clientid: updates.clientId,
        clientname: updates.clientName,
        date: updates.date,
        notes: updates.notes,
        status: updates.status,
        discount: 0, // Setting fixed discount to 0
        updatedat: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating order:', error);
      throw error;
    }
    
    // Next, delete existing items in EncomendasItems table
    const { error: deleteError } = await supabase
      .from('EncomendasItems')
      .delete()
      .eq('encomendaid', id);
    
    if (deleteError) {
      console.error('Error deleting existing order items:', deleteError);
      throw deleteError;
    }
    
    // Finally, insert the updated items into EncomendasItems
    if (updates.items && updates.items.length > 0) {
      const orderItems = updates.items.map(item => ({
        encomendaid: id,
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
        console.error('Error creating updated order items:', itemsError);
      }
    }
    
    // Fetch the updated order to return
    const updatedOrder = await fetchOrderById(id);
    return updatedOrder;
  } catch (error) {
    console.error('Error in updateOrder:', error);
    return null;
  }
}

// Delete an order
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    // First, delete items in EncomendasItems table
    const { error: itemsError } = await supabase
      .from('EncomendasItems')
      .delete()
      .eq('encomendaid', id);
    
    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
    }
    
    // Then, delete the order in Encomendas table
    const { error } = await supabase
      .from('Encomendas')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting order:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    return false;
  }
}

// Fetch order by ID
export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('Encomendas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (orderError) {
      throw orderError;
    }
    
    if (!orderData) {
      console.log(`Order with ID ${id} not found`);
      return null;
    }
    
    // Fetch order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('EncomendasItems')
      .select('*')
      .eq('encomendaid', id);
    
    if (itemsError) {
      throw itemsError;
    }
    
    // Map items to the expected format
    const mappedItems = (itemsData || []).map(item => ({
      productId: item.productid,
      productName: item.productname,
      quantity: item.quantity,
      salePrice: item.saleprice,
      discount: item.discount || 0
    }));
    
    const mappedOrder: Order = {
      id: orderData.id,
      clientId: orderData.clientid,
      clientName: orderData.clientname,
      orderNumber: orderData.ordernumber,
      date: orderData.date,
      notes: orderData.notes,
      status: orderData.status as "pending" | "completed" | "cancelled",
      discount: 0, // Setting fixed discount to 0
      convertedToStockExitId: orderData.convertedtostockexitid,
      createdAt: orderData.createdat,
      updatedAt: orderData.updatedat,
      items: mappedItems
    };
    
    return mappedOrder;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
}
