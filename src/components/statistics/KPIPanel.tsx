
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, Euro, BadgeDollarSign, Users, BadgePercent, Info, CalendarDays } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercent } from '@/utils/formatting';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface KPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  description: string;
  formula: string;
  isPercentage?: boolean;
  previousValue?: number;
  tooltip?: string;
  belowTarget?: boolean;
}

interface KPIPanelProps {
  kpis: KPI[];
  title?: string;
  description?: string;
}

const KPIPanel = ({ kpis, title = "KPIs", description = "Indicadores-chave de desempenho" }: KPIPanelProps) => {
  // Helper function to get trend icon
  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return null;
    
    return previous < current ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  // Helper function to format value based on unit
  const formatValue = (value: number, unit: string, isPercentage?: boolean) => {
    if (isPercentage) return formatPercent(value);
    if (unit === '€') return formatCurrency(value);
    return value.toLocaleString();
  };
  
  // Calculate progress percentage for the progress bar
  const calculateProgress = (value: number, target: number) => {
    if (target === 0) return 0;
    const progress = (value / target) * 100;
    return progress > 100 ? 100 : progress;
  };

  // Get icon based on KPI name
  const getKPIIcon = (name: string) => {
    const icons = {
      'ROI': <Euro className="h-4 w-4 text-blue-500" />,
      'Margem de Lucro': <BadgeDollarSign className="h-4 w-4 text-green-500" />,
      'Ponto de Equilíbrio': <Info className="h-4 w-4 text-orange-500" />,
      'Taxa de Conversão': <BadgePercent className="h-4 w-4 text-purple-500" />,
      'Churn Rate': <Users className="h-4 w-4 text-red-500" />,
      'Lifetime Value': <Euro className="h-4 w-4 text-green-500" />,
      'NPS': <Users className="h-4 w-4 text-blue-500" />,
    };
    
    // Find the closest match or return default icon
    const key = Object.keys(icons).find(k => name.includes(k));
    return key ? icons[key as keyof typeof icons] : <Info className="h-4 w-4 text-gray-500" />;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, index) => (
            <TooltipProvider key={index}>
              <Card className={`shadow-sm ${kpi.belowTarget ? 'border-orange-300' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getKPIIcon(kpi.name)}
                    {kpi.name}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p><strong>Descrição:</strong> {kpi.description}</p>
                        <p className="mt-1"><strong>Fórmula:</strong> {kpi.formula}</p>
                        {kpi.tooltip && <p className="mt-1">{kpi.tooltip}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {kpi.unit === '€' && !kpi.isPercentage && '€ '}
                      {formatValue(kpi.value, kpi.unit, kpi.isPercentage)}
                      {kpi.unit !== '€' && !kpi.isPercentage && ` ${kpi.unit}`}
                    </div>
                    {getTrendIcon(kpi.value, kpi.previousValue)}
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Meta: {formatValue(kpi.target, kpi.unit, kpi.isPercentage)}</span>
                      <span>{Math.round(calculateProgress(kpi.value, kpi.target))}%</span>
                    </div>
                    <Progress 
                      value={calculateProgress(kpi.value, kpi.target)} 
                      className={`h-2 ${kpi.belowTarget ? 'bg-orange-100' : 'bg-gray-100'}`}
                    />
                  </div>
                  
                  {kpi.belowTarget && (
                    <Alert className="mt-2 py-2 bg-orange-50 border-orange-200">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      <AlertDescription className="text-xs text-orange-700">
                        Este KPI está abaixo da meta esperada
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPIPanel;
