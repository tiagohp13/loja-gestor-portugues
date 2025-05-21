
import React, { useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import { useSupportData } from './suporte/hooks/useSupportData';
import SupportChart from './suporte/components/SupportChart';
import MetricsCards from './suporte/components/MetricsCards';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Suporte = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { isLoading, stats } = useSupportData();
  
  const navigateToProductDetail = (id: string) => {
    navigate(`/produtos/${id}`);
  };
  
  // Priorizar o carregamento do gráfico principal ao invés de carregar tudo de uma vez
  useEffect(() => {
    // Pré-carregar componentes importantes após o componente principal ser montado
    const preloadComponents = async () => {
      const importPromises = [
        import('./suporte/components/MetricsCards'),
      ];
      
      try {
        await Promise.all(importPromises);
      } catch (error) {
        console.error('Error preloading components:', error);
      }
    };
    
    // Usar requestIdleCallback ou setTimeout como fallback para não bloquear o thread principal
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => preloadComponents());
    } else {
      setTimeout(preloadComponents, 1000); // 1 segundo após renderização inicial
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size={32} />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard de Estatísticas" 
        description="Visualize estatísticas importantes do seu negócio"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <SupportChart 
          chartType="resumo"
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
      
      {/* KPI Panel removed from here and moved to Dashboard.tsx */}
    </div>
  );
};

export default Suporte;
