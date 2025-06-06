import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obter o caminho para onde redirecionar após login
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Se já estiver autenticado, redireciona imediatamente
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verifica estado do Caps Lock
  const handleCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const capsOn = e.getModifierState && e.getModifierState('CapsLock');
    setIsCapsLockOn(capsOn);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 relative">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e40af" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Login box */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
        <div className="p-4 sm:p-6">
          {/* Logo sem borda adicional */}
          <div className="flex justify-center mb-2">
            <img
              src="/lovable-uploads/43c0e0df-8fbe-4332-9b09-1437e2354fd4.png"
              alt="Aqua Paraíso"
              className="w-auto h-32 drop-shadow-lg rounded-md"
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
                autoFocus
                className="w-full"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleCapsLock}
                  onKeyUp={handleCapsLock}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showPass ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20a10 10 0 0 1-9.9-8H4a8 8 0 0 0 15.94 2.94z" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1.05 12A11.95 11.95 0 0 1 12 2c5.52 0 10.16 3.76 11.78 9-.89 2.83-2.86 5.34-5.52 6.79" />
                      <path d="M2.33 2.33l19.34 19.34" />
                    </svg>
                  )}
                </button>
              </div>
              {isCapsLockOn && (
                <p className="text-xs text-red-600">Caps Lock está ativado</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((v) => !v)}
                className="h-4 w-4 text-gestorApp-blue focus:ring-gestorApp-blue-dark border-gray-300 rounded"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Lembrar-me
              </label>
            </div>

            {/* Botão “Entrar” realçado */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gestorApp-blue hover:bg-gestorApp-blue-dark shadow-md flex items-center justify-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
              )}
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
