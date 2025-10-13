
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KPI } from '@/components/statistics/KPIPanel';

interface KPICardProps {
  kpi: KPI;
  onClick?: () => void;
}

const KPICard = ({ kpi, onClick }: KPICardProps) => {
  // Helper function to get trend icon based on comparison with target
  const getTrendIcon = () => {
    // Inversa a lógica para KPIs inversos (onde menor é melhor)
    if (kpi.isInverseKPI) {
      if (kpi.value <= kpi.target) {
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      } else {
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      }
    } else {
      // Lógica normal (maior é melhor)
      if (kpi.value >= kpi.target) {
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      } else {
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      }
    }
  };

  // Helper function to format value based on unit
  const formatValue = (value: number) => {
    // Ensure the value is a valid number before formatting
    if (isNaN(value) || value === undefined || value === null) {
      return kpi.isPercentage ? "0,00%" : "0";
    }
    
    if (kpi.isPercentage) return formatPercentage(value);
    if (kpi.unit === '€') return formatCurrency(value);
    return value.toLocaleString();
  };
  
  // Calculate progress percentage for the progress bar
  const calculateProgress = () => {
    if (kpi.target === 0) return 0;
    if (isNaN(kpi.value) || kpi.value === undefined || kpi.value === null) return 0;
    const progress = (kpi.value / kpi.target) * 100;
    return progress > 100 ? 100 : progress;
  };

  // Get icon based on KPI name
  const getKPIIcon = () => {
    // Map KPI names to their respective icons with appropriate colors
    const { name } = kpi;
    if (name.includes('ROI')) {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
    if (name.includes('Margem de Lucro')) {
      return <Info className="h-4 w-4 text-green-500" />;
    }
    if (name.includes('Taxa de Conversão')) {
      return <Info className="h-4 w-4 text-purple-500" />;
    }
    if (name.includes('Valor Médio de Compra')) {
      return <Info className="h-4 w-4 text-orange-500" />;
    }
    if (name.includes('Valor Médio de Venda')) {
      return <Info className="h-4 w-4 text-blue-400" />;
    }
    if (name.includes('Lucro Médio por Venda')) {
      return <Info className="h-4 w-4 text-teal-500" />;
    }
    if (name.includes('Lucro Total')) {
      return <Info className="h-4 w-4 text-amber-500" />;
    }
    if (name.includes('Lucro por Cliente')) {
      return <Info className="h-4 w-4 text-indigo-500" />;
    }
    
    // Default fallback
    return <Info className="h-4 w-4 text-gray-500" />;
  };

  // Helper para obter a mensagem de alerta baseada no KPI
  const getAlertMessage = () => {
    // Mensagem especial para o Valor Médio de Compra
    if (kpi.name.includes('Valor Médio de Compra')) {
      return kpi.value <= kpi.target 
        ? "O valor médio por compra está dentro do esperado." 
        : "O valor médio por compra está acima do pretendido.";
    }
    
    // Mensagem padrão para outros KPIs
    return "Este KPI está abaixo da meta esperada";
  };
  
  // Helper para verificar se um KPI está abaixo da sua meta
  const checkIfBelowTarget = () => {
    // Para o KPI Valor Médio de Compra, a lógica é inversa
    if (kpi.name.includes('Valor Médio de Compra')) {
      return kpi.value > kpi.target;
    }
    
    // Para os outros KPIs, a lógica padrão
    return kpi.value < kpi.target;
  };

  const belowTarget = checkIfBelowTarget();
  const progress = calculateProgress();
  
 return (
  <TooltipProvider>
    <Card
      className={`shadow-sm transition-all cursor-pointer hover:shadow-md hover:border-gray-300 ${
        belowTarget ? "border-orange-300" : "border-emerald-300"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col justify-between h-full">
        {/* Header (título + ícone + tooltip) */}
        <div>
          <div className="text-sm font-medium flex items-center gap-2 mb-2">
            {getKPIIcon()}
            {kpi.name}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  <strong>Descrição:</strong> {kpi.description}
                </p>
                <p className="mt-1">
                  <strong>Fórmula:</strong> {kpi.formula}
                </p>
                {kpi.tooltip && <p className="mt-1">{kpi.tooltip}</p>}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Valor principal — fixado visualmente */}
          <div className="flex items-end justify-between min-h-[60px]">
            <div className="text-2xl font-bold leading-none">
              {kpi.unit === "€" && !kpi.isPercentage && "€ "}
              {formatValue(kpi.value)}
              {kpi.unit !== "€" && !kpi.isPercentage && ` ${kpi.unit}`}
              {kpi.isPercentage && "%"}
            </div>
            {getTrendIcon()}
          </div>
        </div>

        {/* Secção inferior — meta e barra */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">
              Meta:{" "}
              <span className="font-medium text-gray-700">
                {formatValue(kpi.target)}
              </span>
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className={`h-2 ${
              belowTarget ? "bg-orange-100" : "bg-gray-100"
            }`}
          />
        </div>

        {/* Alerta quando abaixo da meta */}
        {belowTarget && (
          <Alert className="mt-3 py-2 bg-orange-50 border-orange-200">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
            <AlertDescription className="text-xs text-orange-700">
              {getAlertMessage()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  </TooltipProvider>
);


export default KPICard;
