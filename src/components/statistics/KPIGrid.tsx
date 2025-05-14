
import React from 'react';
import KPICard from './KPICard';
import { KPI } from './KPIPanel';

interface KPIGridProps {
  kpis: KPI[];
}

const KPIGrid: React.FC<KPIGridProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} kpi={kpi} />
      ))}
    </div>
  );
};

export default KPIGrid;
