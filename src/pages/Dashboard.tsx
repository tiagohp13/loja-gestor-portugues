
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import { useSupportData } from './suporte/hooks/useSupportData';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import QuickActions from '@/components/ui/QuickActions';

// Import components from dashboard
import SalesAndPurchasesChart from './dashboard/components/SalesAndPurchasesChart';
import LowStockProducts from './dashboard/components/LowStockProducts';
import InsufficientStockOrders from './dashboard/components/InsufficientStockOrders';
import PendingOrders from './dashboard/components/PendingOrders';
import { findInsufficientStockOrders } from './dashboard/hooks/utils/orderUtils';

// Import the SummaryCards from support page
import SummaryCards from './suporte/components/SummaryCards';

// Import KPI panel components
import KPIPanel from '@/components/statistics/KPIPanel';

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
    // Use new values that include expenses
    totalSalesValue,
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses
  } = useDashboardData();
  
  // Find orders with insufficient stock
  const insufficientStockItems = findInsufficientStockOrders(orders, products);

  // Filter for pending orders (not converted to stock exit)
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

  // Show loading spinner while support data is loading
  if (isLoadingSupportData) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  // Update support stats to include expenses
  const updatedStats = {
    ...supportStats,
    totalSpent: totalSpentWithExpenses,
    profit: totalProfitWithExpenses,
    profitMargin: profitMarginPercentWithExpenses
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-background min-h-screen">
      <PageHeader 
        title="Dashboard" 
        description="Vista geral do seu negócio"
      />
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Summary Cards with updated stats including expenses */}
      <SummaryCards stats={updatedStats} />
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <SalesAndPurchasesChart chartData={monthlyData} />
      </div>
      
      {/* Products with Low Stock and Pending Orders - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Products with Low Stock */}
        <div>
          <LowStockProducts 
            lowStockProducts={lowStockProducts}
            navigateToProductDetail={navigateToProductDetail}
          />
        </div>
        
        {/* Pending Orders */}
        <div>
          <PendingOrders 
            pendingOrders={pendingOrders}
            navigateToOrderDetail={navigateToOrderDetail}
            navigateToClientDetail={navigateToClientDetail}
          />
        </div>
      </div>
      
      {/* Orders with Insufficient Stock */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <InsufficientStockOrders 
          insufficientItems={insufficientStockItems}
          navigateToProductDetail={navigateToProductDetail}
          navigateToOrderDetail={navigateToOrderDetail}
          navigateToClientDetail={navigateToClientDetail}
        />
      </div>
      
      {/* KPI Panel at the bottom of the dashboard */}
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

export default DashboardPage;
