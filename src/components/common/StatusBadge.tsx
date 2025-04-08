
import React from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  variant?: StatusVariant;
  status?: 'pending' | 'completed' | 'cancelled' | 'active' | 'inactive';
  children?: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, status, children, className }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses: Record<StatusVariant, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  // If status is provided, determine variant and label
  let displayVariant = variant;
  let displayText = children;

  if (status) {
    switch(status) {
      case 'completed':
        displayVariant = 'success';
        displayText = displayText || 'Completado';
        break;
      case 'pending':
        displayVariant = 'warning';
        displayText = displayText || 'Pendente';
        break;
      case 'cancelled':
        displayVariant = 'danger';
        displayText = displayText || 'Cancelado';
        break;
      case 'active':
        displayVariant = 'success';
        displayText = displayText || 'Ativo';
        break;
      case 'inactive':
        displayVariant = 'neutral';
        displayText = displayText || 'Inativo';
        break;
    }
  }
  
  // Default to neutral if no variant is provided
  displayVariant = displayVariant || 'neutral';
  
  return (
    <span className={cn(baseClasses, variantClasses[displayVariant], className)}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
