import React, { useEffect, Suspense, useState } from 'react';
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
import ProductCategoryChart from './dashboard/components/ProductCategoryChart';
import { WidgetConfig } from '@/components/ui/DashboardCustomization/types';

const Suporte = () => {
  useScrollToTop();
  const navigate = useNavigate();
  
  // Get data from both support and dashboard hooks
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
    // New values including expenses
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses,
    roiValueWithExpenses,
    roiPercentWithExpenses
  } = useDashboardData();

  const [statisticsConfig, setStatisticsConfig] = useState<WidgetConfig[]>([]);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('dashboard-layout-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.statistics) {
          setStatisticsConfig(config.statistics);
        }
      }
    };
    
    loadConfig();
    window.addEventListener('storage', loadConfig);
    return () => window.removeEventListener('storage', loadConfig);
  }, []);
  
  const navigateToProductDetail = (id: string) => {
    navigate(`/produtos/${id}`);
  };

  const navigateToClientDetail = (id: string) => {
    navigate(`/clientes/${id}`);
  };

  const navigateToSupplierDetail = (id: string) => {
    navigate(`/fornecedores/${id}`);
  };
  
  if (isSupportDataLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  // Component mapping for statistics page
  const componentMap: { [key: string]: React.ReactNode } = {
    'kpi-grid': (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricsCards stats={stats} showSummaryCardsOnly={true} />
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
    ),
    'metrics-cards': (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricsCards stats={stats} />
      </div>
    ),
    'product-category-chart': (
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <ProductCategoryChart categoryData={[]} />
      </div>
    )
  };

  const sortedEnabledWidgets = statisticsConfig
    .filter(widget => widget.enabled)
    .sort((a, b) => a.order - b.order);

  const singleColumnWidgets = ['kpi-grid', 'featured-products', 'support-chart-resumo', 'metrics-cards', 'product-category-chart'];
  
  const groupedWidgets = sortedEnabledWidgets.reduce((acc, widget, index) => {
    if (singleColumnWidgets.includes(widget.id)) {
      acc.push([widget]);
    } else {
      const prevWidget = sortedEnabledWidgets[index - 1];
      if (prevWidget && !singleColumnWidgets.includes(prevWidget.id) && acc[acc.length - 1].length === 1) {
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
        {groupedWidgets.map((group, groupIndex) => {
          if (group.length > 1) {
            return (
              <div key={groupIndex} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {group.map(widget => (
                  <div key={widget.id}>{componentMap[widget.id]}</div>
                ))}
              </div>
            );
          }
          const widget = group[0];
          return (
            <div key={widget.id}>
              {componentMap[widget.id]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Suporte;
