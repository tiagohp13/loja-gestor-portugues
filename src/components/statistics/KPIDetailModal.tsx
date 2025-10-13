import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, X, TrendingUp, TrendingDown, Info } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { KPI } from "./KPIPanel";

interface KPIDetailModalProps {
  kpi: KPI | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({ kpi, isOpen, onClose, onEdit, canEdit = false }) => {
  if (!kpi) return null;

  // Define ícone conforme o KPI
  const getIcon = () => {
    if (kpi.name.toLowerCase().includes("lucro")) return <TrendingUp className="h-5 w-5 text-emerald-600" />;
    if (kpi.name.toLowerCase().includes("gasto")) return <TrendingDown className="h-5 w-5 text-rose-600" />;
    if (kpi.name.toLowerCase().includes("venda")) return <TrendingUp className="h-5 w-5 text-blue-500" />;
    return <Info className="h-5 w-5 text-gray-500" />;
  };

  const renderValue = (value: number) => {
    if (kpi.isPercentage) return `${value.toFixed(2)}%`;
    if (kpi.unit === "€") return formatCurrency(value);
    return value.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl shadow-lg border border-gray-100">
        <DialogHeader className="relative pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {getIcon()}
              <DialogTitle className="text-lg font-semibold">{kpi.name}</DialogTitle>
            </div>

            <div className="flex gap-1">
              {canEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} title="Editar meta" className="hover:bg-gray-100">
                  <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="ghost" size="icon" title="Fechar" className="hover:bg-gray-100">
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {kpi.description && (
            <DialogDescription className="text-sm text-gray-500">{kpi.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Valor Atual</span>
            <span className="font-semibold text-gray-900">{renderValue(kpi.value)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Meta</span>
            <span className="font-semibold text-gray-900">{renderValue(kpi.target)}</span>
          </div>

          {kpi.previousValue !== undefined && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor Anterior</span>
              <span className="font-semibold text-gray-900">{renderValue(kpi.previousValue)}</span>
            </div>
          )}

          <Separator className="my-2" />

          {kpi.delta30dPct !== undefined && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">📅 Últimos 30 dias</span>
              <span className={`font-semibold ${kpi.delta30dPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {kpi.delta30dPct >= 0 ? "▲" : "▼"} {Math.abs(kpi.delta30dPct).toFixed(2)}%
              </span>
            </div>
          )}

          {kpi.deltaMoMPct !== undefined && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">📆 Mês vs Mês</span>
              <span className={`font-semibold ${kpi.deltaMoMPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {kpi.deltaMoMPct >= 0 ? "▲" : "▼"} {Math.abs(kpi.deltaMoMPct).toFixed(2)}%
              </span>
            </div>
          )}

          <Separator className="my-2" />

          {kpi.formula && (
            <div className="text-sm text-gray-600">
              <strong>Fórmula:</strong> {kpi.formula}
            </div>
          )}

          {kpi.tooltip && (
            <div className="text-sm text-gray-600">
              <strong>Observações:</strong> {kpi.tooltip}
            </div>
          )}

          {kpi.belowTarget !== undefined && (
            <div className={`text-sm font-medium ${kpi.belowTarget ? "text-rose-600" : "text-emerald-600"}`}>
              {kpi.belowTarget ? "Abaixo da meta" : "Acima da meta"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KPIDetailModal;
