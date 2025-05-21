
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiCardProps {
  title: string;
  value: number;
  description: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  tooltipText?: string;
  isPercentage?: boolean;
  iconColor?: string;
  iconBackground?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  description,
  prefix,
  suffix,
  icon, 
  tooltipText,
  isPercentage = false,
  iconColor = 'text-blue-500',
  iconBackground = 'bg-blue-100'
}) => {
  // Format the value based on prefix, suffix or percentage
  let formattedValue = '';
  
  if (isPercentage) {
    formattedValue = formatPercentage(value);
  } else if (prefix === '€') {
    formattedValue = formatCurrency(value);
  } else {
    formattedValue = value.toLocaleString();
    if (prefix) formattedValue = `${prefix}${formattedValue}`;
    if (suffix) formattedValue = `${formattedValue}${suffix}`;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <TooltipProvider>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {icon && (
                <span className={`flex items-center justify-center h-8 w-8 rounded-full ${iconBackground} ${iconColor} mr-2`}>
                  {icon}
                </span>
              )}
              <h3 className="text-sm font-medium">{title}</h3>
            </div>
            {tooltipText && (
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{formattedValue}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
