
import { supabase } from "@/integrations/supabase/client";

export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { 
      user: data.user,
      session: data.session 
    };
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

export async function registerUser(email: string, password: string, name: string) {
  try {
    // Check if user already exists - we can't use getUserByEmail since it's not available
    // Use signInWithPassword with a try/catch to check if the user exists
    try {
      const { data } = await supabase.auth.signInWithPassword({
        email,
        password: password + "_check_existence_only", // Use an invalid password to ensure it fails but checks email
      });
      
      if (data.user) {
        throw new Error('Este email já está registado');
      }
    } catch (error: any) {
      // If the error is not about invalid credentials, then the email doesn't exist
      if (!error.message.includes('Invalid login credentials')) {
        throw error;
      }
    }
    
    // Create new user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        }
      }
    });
    
    if (error) throw error;
    
    return { 
      user: data.user,
      session: data.session 
    };
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session ? { 
      user: data.session.user,
      session: data.session 
    } : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
