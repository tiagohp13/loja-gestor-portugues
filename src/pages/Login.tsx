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
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
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
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 relative">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e40af" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Login box */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
        <div className="p-4 sm:p-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/43c0e0df-8fbe-4332-9b09-1437e2354fd4.png" 
              alt="Aqua Paraíso" 
              className="w-auto h-32 drop-shadow-lg"
            />
          </div>

          {/* Title and Description */}
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Iniciar Sessão</h2>
            <p className="text-sm text-gray-600">
              Aceda ao painel de controlo do seu stock e vendas.
            </p>
          </div>
          
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
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center relative z-10">
        <p className="text-xs text-gray-400">
          © 2025 Aqua Paraíso · Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default Login;
