
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gestorApp-gray-light">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <h1 className="text-2xl font-bold text-gestorApp-blue">Gestor de Stock</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
