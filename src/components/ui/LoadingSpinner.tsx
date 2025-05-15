
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 16, className = '' }) => {
  return (
    <div className={`inline-flex ${className}`}>
      <div 
        className="border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"
        style={{ width: `${size}px`, height: `${size}px` }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
