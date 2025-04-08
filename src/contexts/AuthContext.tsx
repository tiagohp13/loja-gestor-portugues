
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { loginUser } from '../services/authService';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
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
      
      const { user } = await loginUser(email, password);
      
      if (!user) {
        throw new Error('Utilizador não encontrado');
      }
      
      // Ensure the user object has all required properties
      const userWithDefaults: User = {
        id: user.id,
        email: user.email,
        name: user.name || user.nome || user.email,
        role: 'user',
        ...user
      };
      
      setState({ user: userWithDefaults, isAuthenticated: true });
      localStorage.setItem('user', JSON.stringify(userWithDefaults));
      
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

  const logout = () => {
    setState(initialState);
    localStorage.removeItem('user');
    toast.info('Sessão terminada');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
