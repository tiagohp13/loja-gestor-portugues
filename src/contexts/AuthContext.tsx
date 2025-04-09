
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { loginUser, registerUser } from '../services/authService';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser 
      ? { user: JSON.parse(savedUser), isAuthenticated: true } 
      : initialState;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { user: userData } = await loginUser(email, password);
      
      if (!userData) {
        throw new Error('Utilizador não encontrado');
      }
      
      // Map database user to our User type
      const user: User = {
        id: userData.id,
        name: userData.email.split('@')[0], // Use email username as name since name might not exist
        email: userData.email,
        role: 'admin' // Default role
      };
      
      setState({ user, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(user));
      
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
    setState(initialState);
    localStorage.removeItem('user');
    toast.info('Sessão terminada');
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
