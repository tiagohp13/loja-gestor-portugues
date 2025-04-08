
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
    
    // Use check_password RPC instead of verify_password
    // This matches the actual function name in the database
    const { data: pwCheck, error: pwError } = await supabase.rpc(
      'check_password' as any,
      { email, password_to_check: password }
    ) as { data: boolean, error: any };
    
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
