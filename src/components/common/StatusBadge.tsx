
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
  icon?: LucideIcon;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className,
  variant,
  children,
  icon: Icon
}) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  // Se variant foi fornecido, usamos ele para definir as cores
  if (variant) {
    switch (variant) {
      case 'success':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'error':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'warning':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        break;
      case 'info':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        break;
    }
  } else if (status) {
    // Caso contrário, determinamos as cores com base no status
    switch (status.toLowerCase()) {
      case 'ativo':
      case 'ativa':
      case 'concluído':
      case 'concluida':
      case 'concluída':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'inativo':
      case 'inativa':
      case 'cancelado':
      case 'cancelada':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'pendente':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        break;
      case 'em processamento':
      case 'em andamento':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        break;
    }
  }
  
  return (
    <span className={cn(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`, bgColor, textColor, className)}>
      {Icon && <Icon className="w-3.5 h-3.5 mr-1" />}
      {children || status}
    </span>
  );
};

export default StatusBadge;
