
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/authService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    // Setting up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_OUT') {
        console.log('🔴 SIGNED_OUT - Limpando todo o estado');
        
        // CRÍTICO: Limpar COMPLETAMENTE o cache do React Query antes de atualizar estado
        queryClient.clear();
        
        // Limpar estado DEPOIS do cache
        setState({
          user: null,
          session: null,
          isAuthenticated: false,
          isInitialized: true
        });
        
        navigate('/login');
      } else if (event === 'SIGNED_IN') {
        console.log('🟢 SIGNED_IN - Novo utilizador, limpando cache anterior');
        
        // CRÍTICO: Limpar cache completamente antes de carregar novo utilizador
        queryClient.clear();
        
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

            console.log('✅ Utilizador autenticado:', session.user.email);
            
            // Atualizar estado DEPOIS de verificar suspensão
            setState({
              user: session.user,
              session: session,
              isAuthenticated: true,
              isInitialized: true
            });
          }, 0);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Apenas atualizar sessão, sem limpar cache
        setState(prevState => ({
          ...prevState,
          user: session?.user || null,
          session: session,
          isAuthenticated: !!session,
          isInitialized: true
        }));
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
        toast.error('Esta conta está suspensa. Por favor, contacte o administrador.');
        return 'suspended';
      }

      if (result === 'access_expired') {
        toast.error('O seu acesso expirou. Por favor, contacte o administrador.');
        return 'suspended';
      }

      if (result === 'excessive_attempts') {
        toast.error('Conta temporariamente bloqueada por tentativas excessivas. Contacte o administrador.');
        return 'suspended';
      }
      
      // At this point, result must be an object with user and session
      if (!result || !result.user) {
        throw new Error('Utilizador não encontrado');
      }
      
      setState(prevState => ({ 
        ...prevState,
        user: result.user, 
        session: result.session,
        isAuthenticated: true 
      }));

      // Check if user is super admin to determine redirect
      const { data: superAdminData } = await supabase
        .from('user_system_roles')
        .select('role')
        .eq('user_id', result.user.id)
        .eq('role', 'super_admin')
        .maybeSingle();

      toast.success('Login efetuado com sucesso');
      
      // Navigate based on user role
      if (superAdminData) {
        navigate('/admin-panel/dashboard');
      } else {
        navigate('/dashboard');
      }
      
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
      console.log('🔴 LOGOUT - Iniciando limpeza completa');
      
      // CRÍTICO: Limpar COMPLETAMENTE o cache do React Query
      queryClient.clear();
      console.log('🔴 Cache do React Query limpo');
      
      await logoutUser();
      
      setState({
        ...initialState,
        isInitialized: true
      });
      
      console.log('🔴 Estado de autenticação limpo');
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
