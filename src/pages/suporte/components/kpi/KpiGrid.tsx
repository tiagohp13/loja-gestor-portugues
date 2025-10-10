import React, { useState } from "react";
import { useKpiCalculations } from "../../hooks/useKpiCalculations";
import { SupportStats } from "../../types/supportTypes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import KPIEditModal from "./KPIEditModal";
import { usePermissions } from "@/hooks/usePermissions";

interface KpiGridProps {
  stats: SupportStats;
}

const KpiGrid: React.FC<KpiGridProps> = ({ stats }) => {
  const kpis = useKpiCalculations(stats);
  const { isAdmin } = usePermissions();

  const [selectedKpi, setSelectedKpi] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const kpiList = [
    { key: "roi", title: "ROI", value: kpis.roi, suffix: "%", description: "Retorno sobre o Investimento" },
    {
      key: "profitMargin",
      title: "Margem de Lucro",
      value: kpis.profitMargin,
      suffix: "%",
      description: "Lucro / Vendas",
    },
    {
      key: "salesConversionRate",
      title: "Taxa de Conversão",
      value: kpis.salesConversionRate,
      suffix: "%",
      description: "Vendas / Clientes",
    },
    {
      key: "averagePurchaseValue",
      title: "Compra Média",
      value: kpis.averagePurchaseValue,
      prefix: "€",
      description: "Valor médio por compra",
    },
    {
      key: "averageSaleValue",
      title: "Venda Média",
      value: kpis.averageSaleValue,
      prefix: "€",
      description: "Valor médio por venda",
    },
    { key: "totalProfit", title: "Lucro Total", value: kpis.totalProfit, prefix: "€", description: "Vendas - Compras" },
    {
      key: "averageProfitPerSale",
      title: "Lucro por Venda",
      value: kpis.averageProfitPerSale,
      prefix: "€",
      description: "Lucro / Número de vendas",
    },
    {
      key: "profitPerClient",
      title: "Lucro por Cliente",
      value: kpis.profitPerClient,
      prefix: "€",
      description: "Lucro / Número de clientes",
    },
  ];

  const handleSaveKpi = (updatedKpi: any) => {
    if (selectedKpi) {
      setSelectedKpi({ ...updatedKpi });
    }
    setIsEditOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiList.map((kpi) => (
          <Card
            key={kpi.key}
            className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            onClick={() => setSelectedKpi(kpi)}
          >
            <CardHeader>
              <CardTitle className="text-sm">{kpi.title}</CardTitle>
              <CardDescription className="text-xs text-gray-500">{kpi.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {kpi.prefix || ""}
                {kpi.value.toFixed(2)}
                {kpi.suffix || ""}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalhes do KPI */}
      <Dialog open={!!selectedKpi} onOpenChange={() => setSelectedKpi(null)}>
        <DialogContent className="max-w-md relative">
          <DialogHeader>
            <DialogTitle>{selectedKpi?.title}</DialogTitle>
            <DialogDescription>{selectedKpi?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <div>
              <strong>Valor Atual:</strong> {selectedKpi?.prefix || ""}
              {selectedKpi?.value.toFixed(2)}
              {selectedKpi?.suffix || ""}
            </div>
            {selectedKpi?.previousValue !== undefined && (
              <div>
                <strong>Valor Anterior:</strong> {selectedKpi?.prefix || ""}
                {selectedKpi.previousValue.toFixed(2)}
                {selectedKpi?.suffix || ""}
              </div>
            )}
          </div>

          {isAdmin && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Editar KPI
            </Button>
          )}

          <DialogClose asChild>
            <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Modal de edição do KPI */}
      {selectedKpi && isEditOpen && (
        <KPIEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          kpis={[selectedKpi]}
          onSave={(updatedKpis) => handleSaveKpi(updatedKpis[0])}
        />
      )}
    </>
  );
};

export default KpiGrid;
