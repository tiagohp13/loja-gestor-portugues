
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import SummaryCards from './suporte/components/SummaryCards';
import SupportChart from './suporte/components/SupportChart';
import KpiGrid from './suporte/components/kpi/KpiGrid';
import { useSupportData } from './suporte/hooks/useSupportData';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { monthlyData, isLoading, stats } = useSupportData();

  const navigateToProduct = (productId: string) => {
    navigate(`/produtos/${productId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageHeader 
        title="Estatísticas" 
        description="Análise de dados e métricas do negócio" 
      />
      
      <KpiGrid stats={stats} />
      
      <SummaryCards stats={stats} />
      
      <SupportChart 
        data={monthlyData} 
        isLoading={isLoading}
        chartType="bar"
        navigateToProduct={navigateToProduct}
      />
    </div>
  );
};

export default Support;
