
import { supabase } from '../client';

// Type for tables that can be inserted/updated
export type TableName = 'products' | 'categories' | 'clients' | 'suppliers';

/**
 * Insert data into a Supabase table
 */
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

/**
 * Update data in a Supabase table
 */
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

/**
 * Batch insert or update multiple items with enhanced error handling
 */
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

/**
 * Format item data for database based on table type
 */
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
