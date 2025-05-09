
import { SupabaseClientOptions } from '@supabase/supabase-js';

export const getClientOptions = (): SupabaseClientOptions<'public'> => {
  return {
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
  };
};
