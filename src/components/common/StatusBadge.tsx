
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant?: StatusVariant;
  children?: React.ReactNode;
  className?: string;
  status?: string;
  icon?: LucideIcon;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  variant, 
  children, 
  className, 
  status,
  icon: Icon 
}) => {
  // Handle status prop if provided
  if (status && !variant && !children) {
    let statusVariant: StatusVariant = 'neutral';
    let displayText = 'Desconhecido';
    
    switch (status.toLowerCase()) {
      case 'active':
        statusVariant = 'success';
        displayText = 'Ativo';
        break;
      case 'inactive':
        statusVariant = 'danger';
        displayText = 'Inativo';
        break;
      case 'pending':
        statusVariant = 'warning';
        displayText = 'Pendente';
        break;
      default:
        statusVariant = 'neutral';
        displayText = status;
    }
    
    return (
      <Badge 
        variant={mapVariantToUiBadge(statusVariant)} 
        className={className}
      >
        {displayText}
      </Badge>
    );
  }
  
  // Handle explicit variant and children
  return (
    <Badge 
      variant={mapVariantToUiBadge(variant || 'neutral')} 
      className={cn("flex items-center gap-1", className)}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </Badge>
  );
};

// Map our status variants to UI badge variants
function mapVariantToUiBadge(variant: StatusVariant): "default" | "destructive" | "outline" | "secondary" {
  switch (variant) {
    case 'success':
      return 'default'; // Using default (green) for success
    case 'danger':
      return 'destructive';
    case 'warning':
      return 'outline';
    case 'info':
    case 'neutral':
    default:
      return 'secondary';
  }
}

export default StatusBadge;
