
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/authService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Add this to track initialization state
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isInitialized: false, // Add initialization state
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Initialize auth state and set up listener
  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setState(prevState => ({
        ...prevState,
        user: session?.user || null,
        session: session,
        isAuthenticated: !!session,
        isInitialized: true // Mark as initialized when auth state changes
      }));
    });

    // Then check for existing session
    getCurrentUser().then((data) => {
      if (data) {
        setState(prevState => ({
          ...prevState,
          user: data.user,
          session: data.session,
          isAuthenticated: true,
          isInitialized: true
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          isInitialized: true // Mark as initialized even if no session found
        }));
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { user, session } = await loginUser(email, password);
      
      if (!user) {
        throw new Error('Utilizador não encontrado');
      }
      
      setState(prevState => ({ 
        ...prevState,
        user, 
        session,
        isAuthenticated: true 
      }));
      
      toast.success('Login efetuado com sucesso');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao efetuar login');
      }
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await registerUser(email, password, name);
      
      toast.success('Registo efetuado com sucesso. Pode fazer login.');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao efetuar registo');
      }
      return false;
    }
  };

  const logout = () => {
    logoutUser()
      .then(() => {
        setState(initialState);
        toast.info('Sessão terminada');
      })
      .catch((error) => {
        console.error('Error during logout:', error);
        toast.error('Erro ao terminar sessão');
      });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
