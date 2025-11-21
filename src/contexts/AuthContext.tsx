
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/authService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean | 'suspended'>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isInitialized: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  useEffect(() => {
    // Setting up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          session: null,
          isAuthenticated: false,
          isInitialized: true
        });
        
        navigate('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Check if user is suspended
        if (session?.user) {
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('is_suspended')
              .eq('user_id', session.user.id)
              .single();

            if (profile?.is_suspended) {
              console.log('User is suspended, signing out');
              await supabase.auth.signOut();
              toast.error('A sua conta foi suspensa. Contacte o administrador.');
              return;
            }

            // When a user signs in or token refreshes, update auth state
            setState(prevState => ({
              ...prevState,
              user: session?.user || null,
              session: session,
              isAuthenticated: !!session,
              isInitialized: true
            }));
          }, 0);
        } else {
          setState(prevState => ({
            ...prevState,
            user: session?.user || null,
            session: session,
            isAuthenticated: !!session,
            isInitialized: true
          }));
        }
      }
    });

    // Initial session check
    getCurrentUser().then(async (data) => {
      if (data?.user) {
        // Check if user is suspended
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_suspended')
          .eq('user_id', data.user.id)
          .single();

        if (profile?.is_suspended) {
          console.log('User is suspended during initialization, signing out');
          await supabase.auth.signOut();
          toast.error('A sua conta foi suspensa. Contacte o administrador.');
          setState(prevState => ({
            ...prevState,
            isInitialized: true
          }));
          return;
        }

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
          isInitialized: true
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string): Promise<boolean | 'suspended'> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await loginUser(email, password);
      
      if (result === 'suspended') {
        return 'suspended';
      }
      
      if (!result || !result.user) {
        throw new Error('Utilizador não encontrado');
      }
      
      setState(prevState => ({ 
        ...prevState,
        user: result.user, 
        session: result.session,
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

  const logout = async () => {
    try {
      await logoutUser();
      
      setState({
        ...initialState,
        isInitialized: true
      });
      
      toast.success('Sessão terminada');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao terminar sessão');
      return false;
    }
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
