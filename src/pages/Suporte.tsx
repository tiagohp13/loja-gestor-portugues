
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import SummaryCards from './suporte/components/SummaryCards';
import SupportChart from './suporte/components/SupportChart';
import KpiGrid from './suporte/components/kpi/KpiGrid';
import { useSupportData } from './suporte/hooks/useSupportData';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Support = () => {
  useScrollToTop();
  
  const { data, isLoading } = useSupportData();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageHeader 
        title="Estatísticas" 
        description="Análise de dados e métricas do negócio" 
      />
      
      <KpiGrid isLoading={isLoading} />
      
      <SummaryCards data={data} isLoading={isLoading} />
      
      <SupportChart data={data} isLoading={isLoading} />
    </div>
  );
};

export default Support;
