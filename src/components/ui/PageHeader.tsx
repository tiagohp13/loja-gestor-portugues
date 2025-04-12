
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col ${isMobile ? 'space-y-4' : 'md:flex-row justify-between md:items-center'} mb-4 sm:mb-6`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gestorApp-gray-dark">{title}</h1>
        {description && <p className="mt-1 text-sm sm:text-base text-gestorApp-gray">{description}</p>}
      </div>
      {actions && <div className={`${isMobile ? 'w-full' : 'mt-0'}`}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
