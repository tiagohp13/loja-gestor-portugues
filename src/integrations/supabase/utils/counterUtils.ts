
import { supabase } from '../client';

/**
 * Increment a column value in a table
 */
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

/**
 * Decrement a column value in a table
 */
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
