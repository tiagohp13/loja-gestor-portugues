
import React from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = <Package className="h-12 w-12 text-gestorApp-gray" />,
}) => {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">{title}</h3>
      <p className="text-gestorApp-gray mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
