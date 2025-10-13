
import React, { useState } from 'react';
import KPICard from './KPICard';
import KPIDetailModal from './KPIDetailModal';
import KPIEditModal from './KPIEditModal';
import { KPI } from './KPIPanel';
import { usePermissions } from '@/hooks/usePermissions';

interface KPIGridProps {
  kpis: KPI[];
  onSaveKpis?: (updatedKpis: KPI[]) => void;
}

const KPIGrid: React.FC<KPIGridProps> = ({ kpis, onSaveKpis }) => {
  const { isAdmin } = usePermissions();
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCardClick = (kpi: KPI) => {
    setSelectedKpi(kpi);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSaveTargets = (updatedKpis: KPI[]) => {
    if (onSaveKpis) {
      onSaveKpis(updatedKpis);
    }
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard 
            key={index} 
            kpi={kpi} 
            onClick={() => handleCardClick(kpi)}
          />
        ))}
      </div>

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
