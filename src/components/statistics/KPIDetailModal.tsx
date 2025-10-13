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
import { Pencil, X, Info, Sigma } from "lucide-react";
import { KPI } from "./KPIPanel";
import { formatCurrency } from "@/utils/formatting";

interface KPIDetailModalProps {
  kpi: KPI | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({ kpi, isOpen, onClose, onEdit, canEdit = false }) => {
  if (!kpi) return null;

  const renderValue = (value: number) => {
    if (kpi.isPercentage) return `${value.toFixed(2)}%`;
    if (kpi.unit === "€") return formatCurrency(value);
    return value.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl shadow-lg border border-gray-100">
        <DialogHeader className="relative pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-500" />
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
            <DialogDescription className="text-sm text-gray-500 mt-1">{kpi.description}</DialogDescription>
          )}

          {/* Fórmula (sem rótulo “Como é calculado”) */}
          {kpi.formula && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <Sigma className="h-4 w-4 text-gray-500" />
              <span>{kpi.formula}</span>
            </div>
          )}
        </DialogHeader>

        {/* Removido: mini gráfico */}
        {/* Removido: campo "Mês Anterior" */}

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Valor Atual</span>
            <span className="font-semibold text-gray-900">{renderValue(kpi.value)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Meta</span>
            <span className="font-semibold text-gray-900">{renderValue(kpi.target)}</span>
          </div>

          <Separator className="my-2" />

          {kpi.tooltip && (
            <div className="text-sm text-gray-600">
              <strong>Observações:</strong> {kpi.tooltip}
            </div>
          )}

          {typeof kpi.belowTarget === "boolean" && (
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
