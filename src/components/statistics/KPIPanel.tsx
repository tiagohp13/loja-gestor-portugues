import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import KPIEditModal from "./KPIEditModal";
import KPIGrid from "./KPIGrid";
import KPIPanelSkeleton from "./KPIPanelSkeleton";
import { loadKpiTargets } from "@/services/kpiService";
import { toast } from "@/components/ui/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

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
  isInverseKPI?: boolean;
}

interface KPIPanelProps {
  kpis: KPI[];
  title?: string;
  description?: string;
}

const KPIPanel = ({
  kpis: initialKpis,
  title = "KPIs",
  description = "Indicadores-chave de desempenho",
}: KPIPanelProps) => {
  const { isAdmin } = usePermissions();
  const [kpisState, setKpisState] = useState<KPI[]>(initialKpis);
  const [editKpi, setEditKpi] = useState<KPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Atualiza o estado dos KPIs quando props mudam
  useEffect(() => {
    setKpisState(initialKpis);
    setIsLoading(false);
  }, [initialKpis]);

  // Carregar metas salvas da base de dados
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setIsLoading(true);
        const savedTargets = await loadKpiTargets();
        if (Object.keys(savedTargets).length > 0) {
          setKpisState((prev) =>
            prev.map((kpi) => ({
              ...kpi,
              target: savedTargets[kpi.name] !== undefined ? savedTargets[kpi.name] : kpi.target,
              belowTarget: kpi.isInverseKPI
                ? kpi.value > (savedTargets[kpi.name] ?? kpi.target)
                : kpi.value < (savedTargets[kpi.name] ?? kpi.target),
            })),
          );
        } else {
          setKpisState(initialKpis);
        }
      } catch (error) {
        console.error("Erro ao carregar metas dos KPIs:", error);
        toast({
          title: "Erro ao carregar metas",
          description: "Não foi possível carregar as metas personalizadas dos KPIs.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (initialKpis.length > 0) fetchTargets();
  }, [initialKpis.length]);

  // Atualiza um KPI individual
  const handleSaveTarget = (updatedKpi: KPI) => {
    setKpisState((prev) => prev.map((kpi) => (kpi.name === updatedKpi.name ? updatedKpi : kpi)));
    setEditKpi(null);
  };

  if (isLoading) {
    return <KPIPanelSkeleton title={title} description={description} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {kpisState.map((kpi) => (
            <Card key={kpi.name} className="relative">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm">{kpi.name}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">{kpi.description}</CardDescription>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="icon" className="h-6 w-6 p-0" onClick={() => setEditKpi(kpi)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">
                    {kpi.isPercentage ? `${kpi.value.toFixed(2)}%` : `${kpi.value.toFixed(2)} ${kpi.unit}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    Meta: {kpi.isPercentage ? `${kpi.target.toFixed(2)}%` : `${kpi.target.toFixed(2)} ${kpi.unit}`}
                  </span>
                  {kpi.belowTarget && <span className="text-xs text-red-600 font-medium">Abaixo da meta</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {editKpi && (
        <KPIEditModal
          isOpen={!!editKpi}
          onClose={() => setEditKpi(null)}
          kpis={[editKpi]}
          onSave={(updatedKpis) => handleSaveTarget(updatedKpis[0])}
        />
      )}
    </Card>
  );
};

export default KPIPanel;
