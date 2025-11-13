import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import KPIEditModal from './KPIEditModal';
import KPIGrid from './KPIGrid';
import KPIPanelSkeleton from './KPIPanelSkeleton';
import { loadKpiTargets } from '@/services/kpiService';
import { toast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
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
  delta30dPct?: number;
  deltaMoMPct?: number;
}
interface KPIPanelProps {
  kpis: KPI[];
  title?: string;
  description?: string;
}
const KPIPanel = ({
  kpis: initialKpis,
  title = "KPIs",
  description = "Indicadores-chave de desempenho"
}: KPIPanelProps) => {
  const {
    isAdmin
  } = usePermissions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [kpisState, setKpisState] = useState<KPI[]>(initialKpis);
  const [isLoading, setIsLoading] = useState(true);

  // Update KPIs state when props change (for real-time updates)
  useEffect(() => {
    setKpisState(initialKpis);
    setIsLoading(false);
  }, [initialKpis]);

  // Carregar metas personalizadas ao inicializar o componente
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setIsLoading(true);
        const savedTargets = await loadKpiTargets();
        if (Object.keys(savedTargets).length > 0) {
          // Atualizar as metas dos KPIs com os valores salvos
          setKpisState(prev => prev.map(kpi => ({
            ...kpi,
            target: savedTargets[kpi.name] !== undefined ? savedTargets[kpi.name] : kpi.target,
            belowTarget: kpi.isInverseKPI ? kpi.value > (savedTargets[kpi.name] ?? kpi.target) : kpi.value < (savedTargets[kpi.name] ?? kpi.target)
          })));
        } else {
          setKpisState(initialKpis);
        }
      } catch (error) {
        console.error('Erro ao carregar metas dos KPIs:', error);
        toast({
          title: "Erro ao carregar metas",
          description: "Não foi possível carregar as metas personalizadas dos KPIs.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch targets if we have initial KPIs
    if (initialKpis.length > 0) {
      fetchTargets();
    }
  }, [initialKpis.length]);

  // Update KPIs when targets are saved
  const handleSaveTargets = (updatedKpis: KPI[]) => {
    setKpisState(updatedKpis);
    setIsEditModalOpen(false);
  };
  if (isLoading) {
    return <KPIPanelSkeleton title={title} description={description} />;
  }
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {isAdmin}
      </CardHeader>
      <CardContent>
        <KPIGrid kpis={kpisState} onSaveKpis={handleSaveTargets} />
      </CardContent>
      
      <KPIEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} kpis={kpisState} onSave={handleSaveTargets} />
    </Card>;
};
export default KPIPanel;