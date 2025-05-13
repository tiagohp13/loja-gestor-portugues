
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartType } from '@/components/statistics/ChartDropdown';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import KPIPanel from '@/components/statistics/KPIPanel';
import { useSupportData } from './suporte/hooks/useSupportData';
import SummaryCards from './suporte/components/SummaryCards';
import SupportChart from './suporte/components/SupportChart';
import MetricsCards from './suporte/components/MetricsCards';
import { useToast } from '@/hooks/use-toast';

const Suporte = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chartType, setChartType] = useState<ChartType>('resumo');
  const { isLoading, stats, kpis } = useSupportData();
  
  const navigateToProductDetail = (id: string) => {
    navigate(`/produtos/${id}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard de Estatísticas" 
        description="Visualize estatísticas importantes do seu negócio"
      />
      
      <SummaryCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <SupportChart 
          chartType={chartType}
          setChartType={setChartType}
          data={{
            monthlyData: stats.monthlyData,
            topProducts: stats.topProducts,
            topClients: stats.topClients,
            topSuppliers: stats.topSuppliers,
            lowStockProducts: stats.lowStockProducts,
            monthlyOrders: stats.monthlyOrders
          }}
          isLoading={isLoading}
          navigateToProduct={navigateToProductDetail}
        />
      </div>
      
      <MetricsCards stats={stats} />
      
      {/* KPI Panel moved to the bottom of the page */}
      <div className="mb-6">
        <KPIPanel 
          title="Indicadores de Performance" 
          description="Principais KPIs do negócio" 
          kpis={kpis} 
        />
      </div>
    </div>
  );
};

export default Suporte;
