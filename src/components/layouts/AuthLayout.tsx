import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  // This layout is no longer used for the login page as it now has its own custom layout
  // Keeping this component for backward compatibility
  return (
    <div className="min-h-screen flex items-center justify-center bg-gestorApp-gray-light p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex justify-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gestorApp-blue">Gestor de Stock</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
