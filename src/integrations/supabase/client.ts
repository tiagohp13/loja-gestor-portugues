
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ptkqosrcopnsclgyrjqh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a3Fvc3Jjb3Buc2NsZ3lyanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Nzg2MzUsImV4cCI6MjA1OTU1NDYzNX0.02iDkud89OEj98hFFkOt8_QNhs_N6uqAXj4laoZi7Mk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Disable automatic URL detection
      storage: localStorage // Explicitly use localStorage for auth storage
    },
    global: {
      fetch: fetch
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Utility function to convert Supabase snake_case to camelCase
export const snakeToCamel = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = snakeToCamel(obj[key]);
    return result;
  }, {} as any);
};

// Convert camelCase to snake_case for Supabase
export const camelToSnake = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    result[snakeKey] = camelToSnake(obj[key]);
    return result;
  }, {} as any);
};

// Add database functions for increment and decrement
export const increment = async (table: 'products' | 'categories' | 'counters', column: string, id: string, value: number) => {
  try {
    // Modifica a abordagem para não usar a função RPC 'increment_column_value'
    // Obter o valor atual primeiro
    const { data: currentData, error: fetchError } = await supabase
      .from(table)
      .select(column)
      .eq('id', id)
      .single();
    
    if (fetchError || !currentData) {
      console.error(`Item not found when incrementing ${column} in ${table}:`, fetchError);
      return null;
    }
    
    const currentValue = currentData[column];
    const newValue = currentValue + value;
    
    // Atualizar com o novo valor
    const { data, error } = await supabase
      .from(table)
      .update({ [column]: newValue })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error incrementing ${column} in ${table}:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Exception incrementing ${column} in ${table}:`, err);
    return null;
  }
};

export const decrement = async (table: 'products' | 'categories' | 'counters', column: string, id: string, value: number) => {
  try {
    // First get the current value to ensure we don't go below zero
    const { data: currentData, error: fetchError } = await supabase
      .from(table)
      .select(column)
      .eq('id', id)
      .single();
    
    if (fetchError || !currentData) {
      console.error(`Item not found when decrementing ${column} in ${table}:`, fetchError);
      return null;
    }
    
    const currentValue = currentData[column];
    
    // Ensure we don't go below zero
    const newValue = Math.max(0, currentValue - value);
    
    // Update with the new value
    const { data, error } = await supabase
      .from(table)
      .update({ [column]: newValue })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error decrementing ${column} in ${table}:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Exception decrementing ${column} in ${table}:`, err);
    return null;
  }
};

// Type for tables that can be inserted/updated
export type TableName = 'products' | 'categories' | 'clients' | 'suppliers';

// Add a type-safe function to insert data into Supabase tables
export const insertIntoTable = async (table: TableName, data: any) => {
  // Convert any camelCase properties to snake_case for Supabase
  const formattedData = formatItemForDatabase(table, data);
  console.log(`Inserting into ${table}:`, formattedData);
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(formattedData)
    .select();
    
  if (error) {
    console.error(`Error inserting into ${table}:`, error);
  } else {
    console.log(`Successfully inserted into ${table}:`, result);
  }
  
  return { data: result, error };
};

// Add a type-safe function to update data in Supabase tables
export const updateTable = async (table: TableName, id: string, data: any) => {
  // Convert any camelCase properties to snake_case for Supabase
  const formattedData = formatItemForDatabase(table, data);
  console.log(`Updating ${table} with ID ${id}:`, formattedData);
  
  const { data: result, error } = await supabase
    .from(table)
    .update(formattedData)
    .eq('id', id)
    .select();
    
  if (error) {
    console.error(`Error updating ${table}:`, error);
  } else {
    console.log(`Successfully updated ${table}:`, result);
  }
  
  return { data: result, error };
};

// Format item data for database based on table type
const formatItemForDatabase = (table: TableName, item: any) => {
  // Remove fields that shouldn't be sent to Supabase
  const { createdAt, updatedAt, ...cleanedItem } = item;
  
  switch (table) {
    case 'products':
      return {
        id: cleanedItem.id,
        code: cleanedItem.code,
        name: cleanedItem.name,
        description: cleanedItem.description,
        category: cleanedItem.category,
        purchase_price: cleanedItem.purchasePrice,
        sale_price: cleanedItem.salePrice,
        current_stock: cleanedItem.currentStock,
        min_stock: cleanedItem.minStock,
        status: cleanedItem.status,
        image: cleanedItem.image
      };
    case 'clients':
      return {
        id: cleanedItem.id,
        name: cleanedItem.name,
        email: cleanedItem.email,
        phone: cleanedItem.phone,
        address: cleanedItem.address,
        tax_id: cleanedItem.taxId,
        notes: cleanedItem.notes,
        status: cleanedItem.status
      };
    case 'categories':
      return {
        id: cleanedItem.id,
        name: cleanedItem.name,
        description: cleanedItem.description,
        status: cleanedItem.status
      };
    case 'suppliers':
      return {
        id: cleanedItem.id,
        name: cleanedItem.name,
        email: cleanedItem.email,
        phone: cleanedItem.phone,
        address: cleanedItem.address,
        tax_id: cleanedItem.taxId,
        payment_terms: cleanedItem.paymentTerms,
        notes: cleanedItem.notes,
        status: cleanedItem.status
      };
    default:
      return cleanedItem;
  }
};

// Store deleted IDs temporarily to prevent reappearance through real-time updates
const deletedItemsCache: { [table: string]: Set<string> } = {
  stock_entries: new Set<string>(),
  stock_exits: new Set<string>(),
  orders: new Set<string>()
};

// Add an ID to the deleted items cache
export const addToDeletedCache = (table: string, id: string) => {
  if (!deletedItemsCache[table]) {
    deletedItemsCache[table] = new Set<string>();
  }
  deletedItemsCache[table].add(id);
};

// Check if an ID is in the deleted items cache
export const isInDeletedCache = (table: string, id: string): boolean => {
  if (!deletedItemsCache[table]) {
    return false;
  }
  return deletedItemsCache[table].has(id);
};

// Clear an ID from the deleted items cache (use this after successful deletion)
export const removeFromDeletedCache = (table: string, id: string) => {
  if (deletedItemsCache[table]) {
    deletedItemsCache[table].delete(id);
  }
};

// Filter an array to remove items that are in the deleted cache
export const filterDeletedItems = <T extends { id: string }>(table: string, items: T[]): T[] => {
  if (!deletedItemsCache[table]) {
    return items;
  }
  return items.filter(item => !deletedItemsCache[table].has(item.id));
};

// Batch insert or update multiple items with enhanced error handling
export const batchSaveToTable = async (table: TableName, items: any[]): Promise<{success: boolean, errors: string[]}> => {
  const errors: string[] = [];
  let successCount = 0;
  
  console.log(`Batch saving ${items.length} items to ${table}`);
  
  for (const item of items) {
    try {
      if (!item.id) {
        item.id = crypto.randomUUID();
      }
      
      const { error } = await insertIntoTable(table, item);
      
      if (error) {
        errors.push(`Failed to save item: ${error.message}`);
        console.error(`Error saving to ${table}:`, error);
      } else {
        successCount++;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Exception saving item: ${errorMessage}`);
      console.error(`Exception saving to ${table}:`, err);
    }
  }
  
  console.log(`Batch save complete: ${successCount}/${items.length} successful`);
  return {
    success: errors.length === 0,
    errors
  };
};

// Get client's total spent
export const getClientTotalSpent = async (clientId: string): Promise<number> => {
  try {
    // Utilizando uma query SQL direta em vez de RPC function
    const { data, error } = await supabase
      .from('stock_exits')
      .select(`
        id,
        stock_exit_items (
          quantity, 
          sale_price
        )
      `)
      .eq('client_id', clientId);
    
    if (error) {
      console.error('Error fetching client total spent:', error);
      return 0;
    }
    
    // Calcular o total gasto manualmente
    let totalSpent = 0;
    
    if (data && data.length > 0) {
      data.forEach(exit => {
        if (exit.stock_exit_items && exit.stock_exit_items.length > 0) {
          exit.stock_exit_items.forEach((item: any) => {
            totalSpent += (item.quantity * item.sale_price);
          });
        }
      });
    }
    
    return totalSpent;
  } catch (err) {
    console.error('Exception fetching client total spent:', err);
    return 0;
  }
};

// Count pending orders
export const countPendingOrders = async (): Promise<number> => {
  try {
    // Consulta direta em vez de função RPC
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .is('converted_to_stock_exit_id', null);
    
    if (error) {
      console.error('Error counting pending orders:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Exception counting pending orders:', err);
    return 0;
  }
};

// Get products with low stock
export const getLowStockProducts = async (): Promise<any[]> => {
  try {
    // Query for all products first
    const { data, error } = await supabase
      .from('products')
      .select('id, name, code, current_stock, min_stock');
    
    if (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
    
    // Filter products where current_stock < min_stock on the client side
    const lowStockProducts = data ? data.filter(product => 
      product.current_stock < product.min_stock
    ) : [];
    
    return lowStockProducts;
  } catch (err) {
    console.error('Exception fetching low stock products:', err);
    return [];
  }
};
