import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KPI } from "./KPIPanel";
import KPIDetailModal from "./KPIDetailModal";
import KPIEditModal from "./KPIEditModal";
import { usePermissions } from "@/hooks/usePermissions";

interface KPIGridProps {
  kpis: KPI[];
  onSaveKpis?: (updatedKpis: KPI[]) => void;
}

const KPIGrid: React.FC<KPIGridProps> = ({ kpis, onSaveKpis }) => {
  const { isAdmin } = usePermissions();
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Ao clicar num cartão → abre o modal de detalhes
  const handleCardClick = (kpi: KPI) => {
    setSelectedKpi(kpi);
    setIsDetailModalOpen(true);
  };

  // Ao clicar em editar dentro do popup → abre o modal de edição
  const handleEditClick = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSaveTargets = (updatedKpis: KPI[]) => {
    if (!updatedKpis || updatedKpis.length === 0) return;

    // Atualiza apenas o KPI editado, mantendo os outros
    const updatedKpi = updatedKpis[0];
    const mergedKpis = kpis.map((kpi) => (kpi.name === updatedKpi.name ? updatedKpi : kpi));

    if (onSaveKpis) {
      onSaveKpis(mergedKpis);
    }

    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
  };

  return (
    <>
      {/* Grelha de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card
            key={index}
            className={`cursor-pointer hover:shadow-lg transition-shadow border ${
              kpi.belowTarget ? "border-red-400" : "border-green-400"
            }`}
            onClick={() => handleCardClick(kpi)}
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

      {/* Modal de detalhes */}
      <KPIDetailModal
        kpi={selectedKpi}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedKpi(null);
        }}
        onEdit={handleEditClick}
        canEdit={isAdmin}
      />

      {/* Modal de edição individual */}
      {selectedKpi && (
        <KPIEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          kpis={[selectedKpi]}
          onSave={handleSaveTargets}
        />
      )}
    </>
  );
};

export default KPIGrid;
