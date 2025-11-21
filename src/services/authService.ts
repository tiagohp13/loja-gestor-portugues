
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export async function loginUser(email: string, password: string): Promise<{ user: User; session: Session } | 'suspended' | 'access_expired' | 'excessive_attempts'> {
  try {
    // Pre-validate login before attempting authentication
    const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-login', {
      body: { 
        email,
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent
      }
    });

    if (validationError) {
      console.error('Error validating login:', validationError);
    }

    if (validationData && !validationData.valid) {
      if (validationData.reason === 'account_suspended' || validationData.reason === 'excessive_attempts') {
        return 'suspended';
      }
      if (validationData.reason === 'access_expired') {
        return 'access_expired';
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Log failed login attempt
      try {
        await supabase.rpc('log_failed_login_attempt', {
          p_email: email,
          p_ip_address: window.location.hostname,
          p_user_agent: navigator.userAgent,
          p_reason: 'incorrect_password'
        });
      } catch (logError) {
        console.error('Failed to log attempt:', logError);
      }
      
      throw error;
    }
    
    if (!data.user) {
      throw new Error('Utilizador não encontrado');
    }

    // Check if user is suspended (double-check after successful auth)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_suspended, access_expires_at')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error checking suspension status:', profileError);
    }

    if (profile?.is_suspended) {
      await supabase.auth.signOut();
      return 'suspended';
    }

    // Check if access has expired
    if (profile?.access_expires_at) {
      const expirationDate = new Date(profile.access_expires_at);
      const now = new Date();
      
      if (expirationDate < now) {
        await supabase.auth.signOut();
        return 'access_expired';
      }
    }
    
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
    // Validate input parameters
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }
    
    if (!password || password.length < 6) {
      throw new Error('A palavra-passe deve ter pelo menos 6 caracteres');
    }
    
    // Create new user with Supabase Auth
    // Supabase will handle duplicate email detection automatically
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: name?.trim() || email.split('@')[0],
        }
      }
    });
    
    // Handle Supabase-specific errors
    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('Este email já está registado');
      }
      throw error;
    }
    
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
