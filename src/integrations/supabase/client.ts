import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const snakeToCamel = (str: string) => str.replace(
  /([-_][a-z])/g,
  (group) => group
    .toUpperCase()
    .replace('-', '')
    .replace('_', '')
);

// Add increment and decrement helper functions
export const increment = (amount: number) => {
  return (value: any) => typeof value === 'number' ? value + amount : amount;
};

export const decrement = (amount: number) => {
  return (value: any) => typeof value === 'number' ? Math.max(0, value - amount) : 0;
};
