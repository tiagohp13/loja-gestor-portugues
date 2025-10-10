import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { KPI } from "./KPIPanel";
import { format } from "date-fns";
import { X } from "lucide-react";

interface KPIGridProps {
  kpis: KPI[];
}

const KPIGrid: React.FC<KPIGridProps> = ({ kpis }) => {
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.name}
            className={`cursor-pointer hover:shadow-lg transition-shadow border ${
              kpi.belowTarget ? "border-red-400" : "border-green-400"
            }`}
            onClick={() => setSelectedKpi(kpi)}
          >
            <CardHeader>
              <CardTitle className="text-sm">{kpi.name}</CardTitle>
              <CardDescription className="text-xs text-gray-500">{kpi.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {kpi.isPercentage
                  ? `${kpi.value.toFixed(2)}%`
                  : kpi.unit === "€"
                    ? `€ ${kpi.value.toFixed(2)}`
                    : kpi.value}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Meta:{" "}
                {kpi.isPercentage
                  ? `${kpi.target.toFixed(2)}%`
                  : kpi.unit === "€"
                    ? `€ ${kpi.target.toFixed(2)}`
                    : kpi.target}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para detalhes do KPI */}
      <Dialog open={!!selectedKpi} onOpenChange={() => setSelectedKpi(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedKpi?.name}</DialogTitle>
            <DialogDescription>{selectedKpi?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <div>
              <strong>Valor Atual:</strong>{" "}
              {selectedKpi?.isPercentage
                ? `${selectedKpi.value.toFixed(2)}%`
                : selectedKpi?.unit === "€"
                  ? `€ ${selectedKpi.value.toFixed(2)}`
                  : selectedKpi?.value}
            </div>
            <div>
              <strong>Meta:</strong>{" "}
              {selectedKpi?.isPercentage
                ? `${selectedKpi.target.toFixed(2)}%`
                : selectedKpi?.unit === "€"
                  ? `€ ${selectedKpi.target.toFixed(2)}`
                  : selectedKpi?.target}
            </div>
            {selectedKpi?.previousValue !== undefined && (
              <div>
                <strong>Valor Anterior:</strong>{" "}
                {selectedKpi.isPercentage
                  ? `${selectedKpi.previousValue.toFixed(2)}%`
                  : selectedKpi.unit === "€"
                    ? `€ ${selectedKpi.previousValue.toFixed(2)}`
                    : selectedKpi.previousValue}
              </div>
            )}
            {selectedKpi?.formula && (
              <div>
                <strong>Fórmula:</strong> {selectedKpi.formula}
              </div>
            )}
            {selectedKpi?.tooltip && (
              <div className="text-gray-500 text-sm">
                <strong>Observações:</strong> {selectedKpi.tooltip}
              </div>
            )}
            {selectedKpi?.belowTarget !== undefined && (
              <div className={`font-medium ${selectedKpi.belowTarget ? "text-red-600" : "text-green-600"}`}>
                {selectedKpi.belowTarget ? "Abaixo da meta" : "Acima da meta"}
              </div>
            )}
          </div>
          <DialogClose asChild>
            <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KPIGrid;
