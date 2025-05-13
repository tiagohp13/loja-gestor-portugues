
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import { getDashboardData } from '../data/mockData';
import PageHeader from '../components/ui/PageHeader';

// Importar componentes do dashboard
import DashboardSummaryCards from './dashboard/components/DashboardSummaryCards';
import SalesAndPurchasesChart from './dashboard/components/SalesAndPurchasesChart';
import LowStockProducts from './dashboard/components/LowStockProducts';
import RecentTransactions from './dashboard/components/RecentTransactions';
import DashboardStatistics from './dashboard/components/DashboardStatistics';
import FeaturedProducts from './dashboard/components/FeaturedProducts';
import { TransactionItem } from './dashboard/hooks/utils/transactionUtils';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dashboardData = getDashboardData();
  
  const {
    products,
    suppliers,
    clients,
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
    roiPercent
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

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Dashboard" 
        description="Vista geral do seu negócio"
      />
      
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
          navigateToProductDetail={navigateToProductDetail}
          maxItems={3}
        />
      </div>
      
      {/* LINHA INFERIOR: Estatísticas + Transações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};

export default DashboardPage;
