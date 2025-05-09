
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  tooltipText: string;
  isPercentage?: boolean;
  iconColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  icon, 
  tooltipText,
  isPercentage = false,
  iconColor = 'text-blue-500'
}) => {
  const formattedValue = isPercentage 
    ? formatPercentage(value) 
    : formatCurrency(value);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <TooltipProvider>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`h-5 w-5 mr-2 ${iconColor}`}>{icon}</span>
              <h3 className="text-sm font-medium">{title}</h3>
            </div>
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <Calculator className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{formattedValue}</p>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
