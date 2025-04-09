
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
      autoRefreshToken: true
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

// Set up generic real-time channel rather than individual ones
// This will help ensure we don't miss any updates
const realtimeChannel = supabase.channel('public:all_tables')
  // Stock Entries
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'stock_entries' }, 
    payload => {
      console.log('Stock entry change received!', payload);
    })
  // Stock Entry Items
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'stock_entry_items' }, 
    payload => {
      console.log('Stock entry item change received!', payload);
    })
  // Stock Exits
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'stock_exits' }, 
    payload => {
      console.log('Stock exit change received!', payload);
    })
  // Stock Exit Items
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'stock_exit_items' }, 
    payload => {
      console.log('Stock exit item change received!', payload);
    })
  // Orders
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' }, 
    payload => {
      console.log('Order change received!', payload);
    })
  // Order Items
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'order_items' }, 
    payload => {
      console.log('Order item change received!', payload);
    })
  // Products
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'products' }, 
    payload => {
      console.log('Product change received!', payload);
    })
  // Categories
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'categories' }, 
    payload => {
      console.log('Category change received!', payload);
    })
  .subscribe();

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

// Add database functions for increment and decrement
export const increment = async (table: 'products' | 'categories' | 'counters', column: string, id: string, value: number) => {
  // Use raw query instead of RPC function due to type issues
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching ${column} in ${table}:`, error);
    return null;
  }
  
  const currentValue = data[column];
  const newValue = currentValue + value;
  
  const { data: updateData, error: updateError } = await supabase
    .from(table)
    .update({ [column]: newValue })
    .eq('id', id)
    .select(column)
    .single();
  
  if (updateError) {
    console.error(`Error incrementing ${column} in ${table}:`, updateError);
    return null;
  }
  
  return updateData[column];
};

export const decrement = async (table: 'products' | 'categories' | 'counters', column: string, id: string, value: number) => {
  // Use raw query instead of RPC function due to type issues
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching ${column} in ${table}:`, error);
    return null;
  }
  
  const currentValue = data[column];
  // Ensure we don't go below zero
  const newValue = Math.max(0, currentValue - value);
  
  const { data: updateData, error: updateError } = await supabase
    .from(table)
    .update({ [column]: newValue })
    .eq('id', id)
    .select(column)
    .single();
  
  if (updateError) {
    console.error(`Error decrementing ${column} in ${table}:`, updateError);
    return null;
  }
  
  return updateData[column];
};
