
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-gestorApp-blue rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gestorApp-gray-dark">A carregar dados...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
