
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import { useSupportData } from './suporte/hooks/useSupportData'; // Add import for support data
import { getDashboardData } from '../data/mockData';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Add import for loading spinner

// Import components from dashboard
import DashboardSummaryCards from './dashboard/components/DashboardSummaryCards';
import SalesAndPurchasesChart from './dashboard/components/SalesAndPurchasesChart';
import LowStockProducts from './dashboard/components/LowStockProducts';
import RecentTransactions from './dashboard/components/RecentTransactions';
import DashboardStatistics from './dashboard/components/DashboardStatistics';
import FeaturedProducts from './dashboard/components/FeaturedProducts';
import InsufficientStockOrders from './dashboard/components/InsufficientStockOrders';
import { TransactionItem } from './dashboard/hooks/utils/transactionUtils';
import { findInsufficientStockOrders } from './dashboard/hooks/utils/orderUtils';

// Import the SummaryCards from support page
import SummaryCards from './suporte/components/SummaryCards';

// Import KPI panel components
import KPIPanel from '@/components/statistics/KPIPanel';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dashboardData = getDashboardData();
  const { isLoading: isLoadingSupportData, stats: supportStats, kpis } = useSupportData(); // Add kpis to the destructured values
  
  const {
    products,
    suppliers,
    clients,
    orders,
    ensureDate,
    monthlyData,
    lowStockProducts,
    recentTransactions,
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
    productSales
  } = useDashboardData();
  
  // Find orders with insufficient stock
  const insufficientStockItems = findInsufficientStockOrders(orders, products);

  const navigateToProductDetail = (id: string) => {
    navigate(`/produtos/${id}`);
  };

  const navigateToClientDetail = (id: string) => {
    navigate(`/clientes/${id}`);
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

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard" 
        description="Vista geral do seu negócio"
      />
      
      {/* Add SummaryCards at the top */}
      <SummaryCards stats={supportStats} />
      
      <DashboardSummaryCards 
        products={products}
        clients={clients}
        suppliers={suppliers}
        totalStockValue={totalStockValue}
      />
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <SalesAndPurchasesChart chartData={monthlyData} />
      </div>
      
      {/* LINHA SUPERIOR: Produtos com Stock Baixo + Produtos em Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LowStockProducts 
          lowStockProducts={lowStockProducts}
          navigateToProductDetail={navigateToProductDetail}
        />
        
        <FeaturedProducts 
          products={products}
          productSales={productSales}
          navigateToProductDetail={navigateToProductDetail}
          maxItems={3}
        />
      </div>
      
      {/* NOVA LINHA: Encomendas com Stock Insuficiente */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <InsufficientStockOrders 
          insufficientItems={insufficientStockItems}
          navigateToProductDetail={navigateToProductDetail}
          navigateToOrderDetail={navigateToOrderDetail}
          navigateToClientDetail={navigateToClientDetail}
        />
      </div>
      
      {/* LINHA INFERIOR: Estatísticas + Transações Recentes */}
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
          recentTransactions={recentTransactions as TransactionItem[]} 
          navigateToProductDetail={navigateToProductDetail}
          navigateToClientDetail={navigateToClientDetail}
          navigateToSupplierDetail={navigateToSupplierDetail}
          ensureDate={ensureDate}
        />
      </div>
      
      {/* Add KPI Panel at the bottom of the dashboard */}
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
