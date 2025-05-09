
import { supabase } from '../client';
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
    const snakeCaseData = camelToSnake(data);
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(snakeCaseData)
      .select();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return null;
    }
    
    return snakeToCamel(result);
  } catch (err) {
    console.error(`Exception inserting into ${table}:`, err);
    return null;
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
      return null;
    }
    
    return snakeToCamel(result);
  } catch (err) {
    console.error(`Exception updating ${table}:`, err);
    return null;
  }
};

/**
 * Batch save (insert or update) records to a table
 */
export const batchSaveToTable = async (table: TableName, records: any[]) => {
  try {
    if (!records || records.length === 0) {
      return [];
    }
    
    const snakeCaseRecords = records.map(record => camelToSnake(record));
    
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
      } else if (updatedData && updatedData.length > 0) {
        results.push(...updatedData);
      }
    }
    
    return snakeToCamel(results);
  } catch (err) {
    console.error(`Exception in batchSaveToTable for ${table}:`, err);
    return [];
  }
};
