
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import { useSupportData } from './suporte/hooks/useSupportData';
import SupportChart from './suporte/components/SupportChart';
import MetricsCards from './suporte/components/MetricsCards';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import FeaturedProducts from './dashboard/components/FeaturedProducts';
import DashboardStatistics from './dashboard/components/DashboardStatistics';
import RecentTransactions from './dashboard/components/RecentTransactions';
import { WidgetConfig } from '@/components/ui/DashboardCustomization/types';

// Default configuration for statistics widgets - reordered to show chart before products
const defaultStatisticsConfig: WidgetConfig[] = [
  { id: 'kpi-grid',             title: 'KPIs',                    order: 0, enabled: true },
  { id: 'support-chart-resumo', title: 'Resumo Financeiro',       order: 1, enabled: true },
  { id: 'featured-products',    title: 'Produtos em Destaque',    order: 2, enabled: true },
  { id: 'dashboard-statistics', title: 'Estatísticas Gerais',      order: 3, enabled: true },
  { id: 'recent-transactions',  title: 'Transações Recentes',      order: 4, enabled: true },
];

const Suporte: React.FC = () => {
  useScrollToTop();
  const navigate = useNavigate();
  
  const { isLoading: isSupportDataLoading, stats } = useSupportData();
  const { 
    products, 
    suppliers, 
    clients,
    ensureDate,
    productSales,
    mostSoldProduct,
    mostFrequentClient,
    mostUsedSupplier,
    totalSalesValue,
    totalPurchaseValue,
    totalStockValue,
    totalProfit,
    profitMarginPercent,
    roiValue,
    roiPercent,
    recentTransactions,
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses,
    roiValueWithExpenses,
    roiPercentWithExpenses
  } = useDashboardData();

  // Initialize statistics configuration from localStorage or default
  const [statisticsConfig, setStatisticsConfig] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('dashboard-layout-config');
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.statistics) {
          return cfg.statistics;
        }
      } catch {
        // ignore
      }
    }
    return defaultStatisticsConfig;
  });

  const navigateToProductDetail = (id: string) => navigate(`/produtos/${id}`);
  const navigateToClientDetail = (id: string) => navigate(`/clientes/${id}`);
  const navigateToSupplierDetail = (id: string) => navigate(`/fornecedores/${id}`);
  
  if (isSupportDataLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  const componentMap: { [key: string]: React.ReactNode } = {
    'kpi-grid': (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricsCards stats={stats} showSummaryCardsOnly />
      </div>
    ),
    'support-chart-resumo': (
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
          isLoading={isSupportDataLoading}
          navigateToProduct={navigateToProductDetail}
        />
      </div>
    ),
    'featured-products': (
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <FeaturedProducts 
          products={products}
          productSales={productSales}
          navigateToProductDetail={navigateToProductDetail}
          maxItems={5}
        />
      </div>
    ),
    'dashboard-statistics': (
      <DashboardStatistics 
        mostSoldProduct={mostSoldProduct}
        mostFrequentClient={mostFrequentClient}
        mostUsedSupplier={mostUsedSupplier}
        totalPurchaseValue={totalPurchaseValue}
        totalSalesValue={totalSalesValue}
        totalProfit={totalProfit}
        profitMarginPercent={profitMarginPercent}
        roiValue={roiValue}
        roiPercent={roiPercent}
        totalSpentWithExpenses={totalSpentWithExpenses}
        totalProfitWithExpenses={totalProfitWithExpenses}
        profitMarginPercentWithExpenses={profitMarginPercentWithExpenses}
        roiValueWithExpenses={roiValueWithExpenses}
        roiPercentWithExpenses={roiPercentWithExpenses}
        navigateToProductDetail={navigateToProductDetail}
        navigateToClientDetail={navigateToClientDetail}
        navigateToSupplierDetail={navigateToSupplierDetail}
      />
    ),
    'recent-transactions': (
      <RecentTransactions 
        recentTransactions={recentTransactions} 
        navigateToProductDetail={navigateToProductDetail}
        navigateToClientDetail={navigateToClientDetail}
        navigateToSupplierDetail={navigateToSupplierDetail}
        ensureDate={ensureDate}
      />
    )
  };

  const sortedEnabledWidgets = statisticsConfig
    .filter(widget => widget.enabled)
    .sort((a, b) => a.order - b.order);

  const singleColumnWidgets = ['kpi-grid', 'featured-products', 'support-chart-resumo'];
  
  const groupedWidgets = sortedEnabledWidgets.reduce((acc, widget, index) => {
    if (singleColumnWidgets.includes(widget.id)) {
      acc.push([widget]);
    } else {
      const prev = sortedEnabledWidgets[index - 1];
      if (prev && !singleColumnWidgets.includes(prev.id) && acc[acc.length - 1].length === 1) {
        acc[acc.length - 1].push(widget);
      } else {
        acc.push([widget]);
      }
    }
    return acc;
  }, [] as WidgetConfig[][]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard de Estatísticas" 
        description="Visualize estatísticas importantes do seu negócio"
      />
      
      <div className="space-y-6">
        {groupedWidgets.map((group, idx) => (
          <div key={idx} className={`${group.length > 1 ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>            
            {group.map(w => <div key={w.id}>{componentMap[w.id]}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suporte;
