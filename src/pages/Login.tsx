
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold mb-6 text-center">Iniciar Sessão</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.pt"
            required
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
      
      <div className="mt-6 text-sm text-center text-gestorApp-gray">
        <p className="text-muted-foreground">
          Use <strong>tiagohp13@hotmail.com</strong> e <strong>*Silva*2020</strong> para login
        </p>
        <p className="text-muted-foreground mt-1">
          Ou <strong>teste@suporte.com</strong> e <strong>teste123</strong>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
