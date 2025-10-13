import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, TrendingUp, TrendingDown, X } from 'lucide-react';
import { KPI } from '@/components/statistics/KPIPanel';
import { formatCurrency, formatPercentage } from '@/utils/formatting';

interface KPIDetailModalProps {
  kpi: KPI | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({ 
  kpi, 
  isOpen, 
  onClose, 
  onEdit,
  canEdit 
}) => {
  if (!kpi) return null;

  const formatValue = (value: number) => {
    if (isNaN(value) || value === undefined || value === null) {
      return kpi.isPercentage ? "0,00%" : "0";
    }
    if (kpi.isPercentage) return formatPercentage(value);
    if (kpi.unit === '€') return formatCurrency(value);
    return value.toLocaleString();
  };

  const isAboveTarget = kpi.isInverseKPI 
    ? kpi.value <= kpi.target 
    : kpi.value >= kpi.target;

  const getDeltaDisplay = (delta: number | undefined) => {
    if (delta === undefined || isNaN(delta)) return null;
    
    const isPositive = delta >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-emerald-600' : 'text-rose-600';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span className="font-semibold">{isPositive ? '+' : ''}{delta.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-2xl font-bold">{kpi.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{kpi.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valor Atual */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
            <p className="text-3xl font-bold">{formatValue(kpi.value)}</p>
          </div>

          {/* Meta e Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Meta</p>
              <p className="text-xl font-semibold">{formatValue(kpi.target)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estado</p>
              <p className={`text-sm font-medium ${
                isAboveTarget ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {isAboveTarget ? '✓ Acima da meta' : '⚠ Abaixo da meta'}
              </p>
            </div>
          </div>

          {/* Variações Percentuais */}
          {(kpi.delta30dPct !== undefined || kpi.deltaMoMPct !== undefined) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Variações</h3>
              
              {kpi.delta30dPct !== undefined && (
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">📅 Últimos 30 dias</span>
                    {getDeltaDisplay(kpi.delta30dPct)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nos últimos 30 dias: <strong>{kpi.delta30dPct >= 0 ? '+' : ''}{kpi.delta30dPct.toFixed(1)}%</strong> comparado com os 30 dias anteriores.
                  </p>
                </div>
              )}

              {kpi.deltaMoMPct !== undefined && (
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">📆 Mês vs Mês</span>
                    {getDeltaDisplay(kpi.deltaMoMPct)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Variação Mês a Mês: <strong>{kpi.deltaMoMPct >= 0 ? '+' : ''}{kpi.deltaMoMPct.toFixed(1)}%</strong> em relação ao mês anterior.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fórmula */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Fórmula de Cálculo</p>
            <p className="text-sm bg-muted/20 rounded p-2 font-mono">{kpi.formula}</p>
          </div>

          {/* Tooltip adicional */}
          {kpi.tooltip && (
            <div className="border-l-4 border-primary pl-4">
              <p className="text-sm text-muted-foreground">{kpi.tooltip}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KPIDetailModal;
