
import { supabase } from "@/integrations/supabase/client";

export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error('Credenciais inválidas');
    }
    
    // Check password (in a real app, you'd use bcrypt or similar)
    // Here we're trusting the database's crypt function that we used in SQL
    // Correct RPC function name based on what's available
    const { data: pwCheck, error: pwError } = await supabase.rpc(
      'verify_password',
      { email, password_to_check: password }
    );
    
    if (pwError) throw pwError;
    
    if (!pwCheck) {
      throw new Error('Credenciais inválidas');
    }
    
    return { user: data };
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}
