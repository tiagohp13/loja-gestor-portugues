
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If already authenticated, redirect to the original page or dashboard
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Navigate to the page they tried to visit before being redirected to login
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">Iniciar Sessão</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 w-full px-2 sm:px-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.pt"
            required
            className="w-full"
            autoComplete="email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Palavra-passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full"
            autoComplete="current-password"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gestorApp-blue hover:bg-gestorApp-blue-dark"
          disabled={isLoading}
        >
          {isLoading ? 'A processar...' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
