
import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import { useSupportData } from './suporte/hooks/useSupportData';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load dos componentes mais pesados
const SalesAndPurchasesChart = lazy(() => import('./dashboard/components/SalesAndPurchasesChart'));
const LowStockProducts = lazy(() => import('./dashboard/components/LowStockProducts'));
const InsufficientStockOrders = lazy(() => import('./dashboard/components/InsufficientStockOrders'));
const PendingOrders = lazy(() => import('./dashboard/components/PendingOrders'));
const KPIPanel = lazy(() => import('@/components/statistics/KPIPanel'));

// Importação normal para widgets leves
import SummaryCards from './suporte/components/SummaryCards';
import { findInsufficientStockOrders } from './dashboard/hooks/utils/orderUtils';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: isLoadingSupportData, stats: supportStats, kpis } = useSupportData();
  const {
    products,
    suppliers,
    clients,
    orders,
    monthlyData,
    lowStockProducts,
    totalStockValue,
    totalSalesValue,
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses
  } = useDashboardData();
  
  const insufficientStockItems = findInsufficientStockOrders(orders, products);
  const pendingOrders = orders.filter(order => !order.convertedToStockExitId);

  const navigateToProductDetail = (id: string) => {
    navigate(`/produtos/${id}`);
  };

  const navigateToClientDetail = (id: string) => {
    navigate(`/clientes/detalhe/${id}`);
  };

  const navigateToSupplierDetail = (id: string) => {
    navigate(`/fornecedores/${id}`);
  };
  
  const navigateToOrderDetail = (id: string) => {
    navigate(`/encomendas/${id}`);
  };

  if (isLoadingSupportData) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  // Atualiza stats incluindo despesas
  const updatedStats = {
    ...supportStats,
    totalSpent: totalSpentWithExpenses,
    profit: totalProfitWithExpenses,
    profitMargin: profitMarginPercentWithExpenses
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard" 
        description="Vista geral do seu negócio"
      />
      
      {/* Summary Cards com dados prioritários */}
      <SummaryCards stats={updatedStats} />
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner size={32} />}>
          <SalesAndPurchasesChart chartData={monthlyData} />
        </Suspense>
      </div>
      
      {/* Produtos com baixo stock e encomendas pendentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <Suspense fallback={<LoadingSpinner size={24} />}>
            <LowStockProducts
              lowStockProducts={lowStockProducts}
              navigateToProductDetail={navigateToProductDetail}
            />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<LoadingSpinner size={24} />}>
            <PendingOrders
              pendingOrders={pendingOrders}
              navigateToOrderDetail={navigateToOrderDetail}
              navigateToClientDetail={navigateToClientDetail}
            />
          </Suspense>
        </div>
      </div>
      
      {/* Encomendas com stock insuficiente */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner size={24} />}>
          <InsufficientStockOrders
            insufficientItems={insufficientStockItems}
            navigateToProductDetail={navigateToProductDetail}
            navigateToOrderDetail={navigateToOrderDetail}
            navigateToClientDetail={navigateToClientDetail}
          />
        </Suspense>
      </div>
      
      {/* KPI Panel */}
      <div className="mb-6">
        <Suspense fallback={<LoadingSpinner size={24} />}>
          <KPIPanel 
            title="Indicadores de Performance"
            description="Principais KPIs do negócio"
            kpis={kpis}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardPage;
