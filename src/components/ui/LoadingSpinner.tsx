
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 12, className }) => {
  const spinnerSize = size || 12;
  
  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <div className="flex flex-col items-center">
        <div 
          className="border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"
          style={{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
