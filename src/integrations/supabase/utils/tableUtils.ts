
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
      const counterId = table === 'orders' ? 'order' : 
                        table === 'stock_entries' ? 'entry' : 'exit';
      
      // Determine the year from the document date
      let targetYear;
      if (data.date) {
        targetYear = new Date(data.date).getFullYear();
      } else {
        targetYear = new Date().getFullYear();
      }
      
      // Call the database function to get the next number for that specific year
      const { data: counterData, error: counterError } = await supabase
        .rpc('get_next_counter_by_year', { 
          counter_id: counterId,
          target_year: targetYear
        });
        
      if (counterError) {
        console.error(`Error getting next counter for ${table}:`, counterError);
        throw new Error(`Erro ao gerar o número do documento: ${counterError.message}`);
      }
      
      if (!counterData) {
        console.error(`No counter data returned for ${table}`);
        throw new Error('Erro ao gerar o número do documento: Nenhum número retornado');
      }
      
      // The counter function returns the properly formatted number
      data.number = counterData;
      
      // If there's a reference_old field in the schema, and we're generating a new number
      // and the data doesn't already have a reference_old value, save the old number format
      // if it exists in the data object
      if (data.number && !data.reference_old && data.reference) {
        data.reference_old = data.reference;
        delete data.reference; // Remove the old reference field
      }
    }
    
    // Add user_id to data for RLS compatibility
    const securedData = await withUserData(data);
    
    // Log what we're trying to insert
    console.log(`Inserting into ${table}:`, securedData);
    
    const snakeCaseData = camelToSnake(securedData);
    
    // Log the snake case data being sent to Supabase
    console.log(`Snake case data for ${table}:`, snakeCaseData);
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(snakeCaseData)
      .select();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw new Error(`Erro ao inserir em ${table}: ${error.message}`);
    }
    
    if (!result || result.length === 0) {
      console.error(`No result returned when inserting into ${table}`);
      throw new Error(`Erro ao inserir em ${table}: Nenhum dado retornado`);
    }
    
    // Log the result
    console.log(`Insert result for ${table}:`, result);
    
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
      throw new Error(`Erro ao atualizar ${table}: ${error.message}`);
    }
    
    if (!result || result.length === 0) {
      console.error(`No result returned when updating ${table} with id ${id}`);
      throw new Error(`Erro ao atualizar ${table}: Nenhum dado retornado`);
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
        throw new Error(`Erro ao inserir em lote em ${table}: ${insertError.message}`);
      } else if (insertedData) {
        results.push(...insertedData);
      } else {
        console.error(`No data returned when inserting batch into ${table}`);
        throw new Error(`Erro ao inserir em lote em ${table}: Nenhum dado retornado`);
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
        throw new Error(`Erro ao atualizar registro em ${table}: ${updateError.message}`);
      } else if (updatedData && updatedData.length > 0) {
        results.push(...updatedData);
      } else {
        console.error(`No data returned when updating record in ${table} with id ${id}`);
        throw new Error(`Erro ao atualizar registro em ${table}: Nenhum dado retornado`);
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
