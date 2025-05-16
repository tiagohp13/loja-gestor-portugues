
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 16,
  className = "" 
}) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${className}`} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        borderColor: 'currentColor',
        borderTopColor: 'transparent' 
      }} 
      aria-label="Carregando..."
    />
  );
};

export default LoadingSpinner;
