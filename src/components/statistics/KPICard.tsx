import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercentage } from "@/utils/formatting";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KPI } from "@/components/statistics/KPIPanel";

interface KPICardProps {
  kpi: KPI;
  onClick?: () => void;
}

const KPICard = React.memo(({ kpi, onClick }: KPICardProps) => {
  const getTrendIcon = () => {
    if (kpi.isInverseKPI) {
      return kpi.value <= kpi.target ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500" />
      );
    } else {
      return kpi.value >= kpi.target ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500" />
      );
    }
  };

  const formatValue = (value: number) => {
    if (isNaN(value) || value === undefined || value === null) {
      return kpi.isPercentage ? "0,00%" : "0";
    }
    if (kpi.isPercentage) return formatPercentage(value);
    if (kpi.unit === "€") return formatCurrency(value);
    return value.toLocaleString();
  };

  const calculateProgress = () => {
    if (kpi.target === 0) return 0;
    if (isNaN(kpi.value) || kpi.value === undefined || kpi.value === null) return 0;
    const progress = (kpi.value / kpi.target) * 100;
    return progress > 100 ? 100 : progress;
  };

  const getKPIIcon = () => {
    const { name } = kpi;
    if (name.includes("ROI")) return <Info className="h-4 w-4 text-blue-500" />;
    if (name.includes("Margem de Lucro")) return <Info className="h-4 w-4 text-green-500" />;
    if (name.includes("Taxa de Conversão")) return <Info className="h-4 w-4 text-purple-500" />;
    if (name.includes("Valor Médio de Compra")) return <Info className="h-4 w-4 text-orange-500" />;
    if (name.includes("Valor Médio de Venda")) return <Info className="h-4 w-4 text-blue-400" />;
    if (name.includes("Lucro Médio por Venda")) return <Info className="h-4 w-4 text-teal-500" />;
    if (name.includes("Lucro Total")) return <Info className="h-4 w-4 text-amber-500" />;
    if (name.includes("Lucro por Cliente")) return <Info className="h-4 w-4 text-indigo-500" />;
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const getAlertMessage = () => {
    if (kpi.name.includes("Valor Médio de Compra")) {
      return kpi.value <= kpi.target
        ? "O valor médio por compra está dentro do esperado."
        : "O valor médio por compra está acima do pretendido.";
    }
    return "Este KPI está abaixo da meta esperada";
  };

  const checkIfBelowTarget = () => {
    if (kpi.name.includes("Valor Médio de Compra")) {
      return kpi.value > kpi.target;
    }
    return kpi.value < kpi.target;
  };

  const belowTarget = checkIfBelowTarget();
  const progress = calculateProgress();

  return (
    <TooltipProvider>
      <Card
        className={`shadow-sm transition-all cursor-pointer hover:shadow-md hover:border-border ${
          belowTarget ? "border-orange-300" : ""
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4 h-full flex flex-col justify-between min-h-[180px]">
          {/* Topo: título e descrição */}
          <div className="min-h-[60px]">
            <div className="text-sm font-medium flex items-center gap-2 mb-1">
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
            <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{kpi.description}</p>
          </div>

          {/* Fundo: valor e meta */}
          <div className="flex flex-col justify-end min-h-[70px] mt-auto">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-semibold text-foreground leading-none">
                {kpi.unit === "€" && !kpi.isPercentage && "€ "}
                {formatValue(kpi.value)}
                {kpi.unit !== "€" && !kpi.isPercentage && ` ${kpi.unit}`}
              </div>
              {getTrendIcon()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Meta: <span className="font-medium text-foreground">{formatValue(kpi.target)}</span>
            </p>
          </div>

          {/* Barra de progresso e alerta */}
          <div className="mt-3">
            <Progress value={progress} className="h-2 bg-muted" />
            {belowTarget && (
              <Alert className="mt-2 py-2 bg-rose-50 border-rose-200">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <AlertDescription className="text-xs text-rose-700">{getAlertMessage()}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

KPICard.displayName = 'KPICard';

export default KPICard;
