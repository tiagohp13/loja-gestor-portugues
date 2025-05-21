
import React, { useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import { useSupportData } from './suporte/hooks/useSupportData';
import SupportChart from './suporte/components/SupportChart';
import MetricsCards from './suporte/components/MetricsCards';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import OperationsSummary from './suporte/components/OperationsSummary';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import FeaturedProducts from './dashboard/components/FeaturedProducts';
import DashboardStatistics from './dashboard/components/DashboardStatistics';
import RecentTransactions from './dashboard/components/RecentTransactions';

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
    recentTransactions
  } = useDashboardData();
  
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard de Estatísticas" 
        description="Visualize estatísticas importantes do seu negócio"
      />
      
      {/* Summary cards at the top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricsCards stats={stats} showSummaryCardsOnly={true} />
      </div>
      
      {/* Support chart (financial summary) */}
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
      
      {/* Operations summary with KPI grid */}
      <div className="mb-6">
        <OperationsSummary stats={stats} />
      </div>
      
      {/* MOVED FROM DASHBOARD: Total Products Card is included in MetricsCards already */}
      
      {/* MOVED FROM DASHBOARD: Featured Products */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <FeaturedProducts 
          products={products}
          productSales={productSales}
          navigateToProductDetail={navigateToProductDetail}
          maxItems={5}
        />
      </div>
      
      {/* MOVED FROM DASHBOARD: Statistics and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
          navigateToProductDetail={navigateToProductDetail}
          navigateToClientDetail={navigateToClientDetail}
          navigateToSupplierDetail={navigateToSupplierDetail}
        />
        
        <RecentTransactions 
          recentTransactions={recentTransactions} 
          navigateToProductDetail={navigateToProductDetail}
          navigateToClientDetail={navigateToClientDetail}
          navigateToSupplierDetail={navigateToSupplierDetail}
          ensureDate={ensureDate}
        />
      </div>
    </div>
  );
};

export default Suporte;
