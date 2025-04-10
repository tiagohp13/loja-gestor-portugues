
import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
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
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className || ''}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
