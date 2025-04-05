
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { users } from '../data/mockData';
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
    // In a real app, this would be an API call
    // Here we're mocking authentication
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, we would check credentials against backend
      // For demo, we'll allow any user from our mock data
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Utilizador não encontrado');
      }
      
      // In a real app, we would check password hash
      // For demo, let's assume "password" is the password for all users
      if (password !== 'password') {
        throw new Error('Palavra-passe incorreta');
      }
      
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
