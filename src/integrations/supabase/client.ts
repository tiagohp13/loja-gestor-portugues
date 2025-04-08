
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
export const supabaseUrl = 'https://ptkqosrcopnsclgyrjqh.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a3Fvc3Jjb3Buc2NsZ3lyanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1OTEyNjYsImV4cCI6MjAyOTE2NzI2Nn0.R7J6lp9qI47qOoYpgGswZ7yHwU1hb0lRK16VD8KfWTQ';

// Criar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'gestor-app-auth'
  }
});
