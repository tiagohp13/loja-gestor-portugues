
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700">A carregar dados...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
