
import { supabase, withUserData } from '../client';
import { camelToSnake, snakeToCamel } from './formatUtils';

export type TableName = 
  | 'products' 
  | 'clients' 
  | 'suppliers' 
  | 'categories' 
  | 'stock_entries' 
  | 'stock_entry_items' 
  | 'stock_exits' 
  | 'stock_exit_items' 
  | 'orders' 
  | 'order_items';

/**
 * Insert a record into a table with proper case conversion
 */
export const insertIntoTable = async (table: TableName, data: any) => {
  try {
    // For documents that need sequential numbering, get a number from the counters table
    if (table === 'orders' || table === 'stock_entries' || table === 'stock_exits') {
      // Get the counter ID based on the table name
      const counterType = table === 'orders' ? 'orders' : 
                        table === 'stock_entries' ? 'stock_entries' : 
                        table === 'stock_exits' ? 'stock_exits' : 'expenses';
      
      const currentYear = new Date().getFullYear();
      
      // Call the database function to get the next formatted number
      const { data: counterData, error: counterError } = await supabase
        .rpc('get_next_counter_by_year', { counter_type: counterType, p_year: currentYear });
        
      if (counterError) {
        console.error(`Error getting next counter for ${table}:`, counterError);
        // Fallback to a timestamp-based number if needed
        const date = new Date();
        const year = date.getFullYear();
        const timestamp = Date.now();
        // Use the correct prefix based on table type
        const prefix = table === 'orders' ? 'ENC' : 
                      table === 'stock_entries' ? 'COMP' : 'VEN';
        data.number = `${prefix}-${year}/${timestamp.toString().slice(-3)}`;
      } else {
        // Format the number with the correct prefix
        const prefix = table === 'orders' ? 'ENC' : 
                      table === 'stock_entries' ? 'COMP' : 'VEN';
        data.number = `${prefix}-${counterData}`;
        
        // If there's a reference_old field in the schema, and we're generating a new number
        // and the data doesn't already have a reference_old value, save the old number format
        // if it exists in the data object
        if (data.number && !data.reference_old && data.reference) {
          data.reference_old = data.reference;
          delete data.reference; // Remove the old reference field
        }
      }
    }
    
    // Add user_id to data for RLS compatibility
    const securedData = await withUserData(data);
    const snakeCaseData = camelToSnake(securedData);
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(snakeCaseData)
      .select();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw new Error(`Error inserting into ${table}: ${error.message}`);
    }
    
    return snakeToCamel(result);
  } catch (err) {
    console.error(`Exception inserting into ${table}:`, err);
    throw err;
  }
};

/**
 * Update a record in a table with proper case conversion
 */
export const updateTable = async (table: TableName, id: string, data: any) => {
  try {
    const snakeCaseData = camelToSnake(data);
    
    const { data: result, error } = await supabase
      .from(table)
      .update(snakeCaseData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw new Error(`Error updating ${table}: ${error.message}`);
    }
    
    return snakeToCamel(result);
  } catch (err) {
    console.error(`Exception updating ${table}:`, err);
    throw err;
  }
};

/**
 * Batch save (insert or update) records to a table
 * and ensure user_id is properly set for RLS
 */
export const batchSaveToTable = async (table: TableName, records: any[]) => {
  try {
    if (!records || records.length === 0) {
      return [];
    }
    
    // Process records one by one to add user_id
    const securedRecords = [];
    for (const record of records) {
      const securedRecord = await withUserData(record);
      securedRecords.push(securedRecord);
    }
    
    const snakeCaseRecords = securedRecords.map(record => camelToSnake(record));
    
    // Split into those with IDs (to update) and those without (to insert)
    const toInsert = snakeCaseRecords.filter(record => !record.id);
    const toUpdate = snakeCaseRecords.filter(record => !!record.id);
    
    const results = [];
    
    // Insert new records
    if (toInsert.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from(table)
        .insert(toInsert)
        .select();
      
      if (insertError) {
        console.error(`Error inserting batch into ${table}:`, insertError);
        throw new Error(`Error inserting batch into ${table}: ${insertError.message}`);
      } else if (insertedData) {
        results.push(...insertedData);
      }
    }
    
    // Update existing records (one by one to ensure proper handling)
    for (const record of toUpdate) {
      const id = record.id;
      
      // Omit id from the update data
      const { id: _, ...updateData } = record;
      
      const { data: updatedData, error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (updateError) {
        console.error(`Error updating record in ${table}:`, updateError);
        throw new Error(`Error updating record in ${table}: ${updateError.message}`);
      } else if (updatedData && updatedData.length > 0) {
        results.push(...updatedData);
      }
    }
    
    return snakeToCamel(results);
  } catch (err) {
    console.error(`Exception in batchSaveToTable for ${table}:`, err);
    throw err;
  }
};

/**
 * Execute a transaction that ensures all operations succeed or fail together
 * @param operations - Array of functions that perform database operations
 * @returns Results from all operations
 */
export const executeTransaction = async (operations: (() => Promise<any>)[]) => {
  let results: any[] = [];
  
  try {
    // Execute each operation in sequence, but fail if any fails
    for (const operation of operations) {
      const result = await operation();
      results.push(result);
    }
    
    return results;
  } catch (err) {
    console.error("Transaction failed:", err);
    throw err;
  }
};
