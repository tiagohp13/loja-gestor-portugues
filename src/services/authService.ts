
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

export async function registerUser(email: string, password: string, name: string) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      throw new Error('Este email já está registado');
    }
    
    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password: password, // The password will be hashed by the database trigger 
          name: name 
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return { user: data };
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
}
