
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import { getDashboardData } from '../data/mockData';
import PageHeader from '../components/ui/PageHeader';

// Importar componentes do dashboard
import DashboardSummaryCards from './dashboard/components/DashboardSummaryCards';
import SalesAndPurchasesChart from './dashboard/components/SalesAndPurchasesChart';
import ProductCategoryChart from './dashboard/components/ProductCategoryChart';
import LowStockProducts from './dashboard/components/LowStockProducts';
import RecentTransactions from './dashboard/components/RecentTransactions';
import DashboardStatistics from './dashboard/components/DashboardStatistics';
import FeaturedProducts from './dashboard/components/FeaturedProducts';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dashboardData = getDashboardData();
  
  const {
    products,
    suppliers,
    clients,
    ensureDate,
    monthlyData,
    categoryData,
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
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <SalesAndPurchasesChart chartData={monthlyData} />
        <ProductCategoryChart categoryData={categoryData} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LowStockProducts 
          lowStockProducts={lowStockProducts}
          navigateToProductDetail={navigateToProductDetail}
        />
        
        <RecentTransactions 
          recentTransactions={recentTransactions}
          navigateToProductDetail={navigateToProductDetail}
          navigateToClientDetail={navigateToClientDetail}
          navigateToSupplierDetail={navigateToSupplierDetail}
          ensureDate={ensureDate}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        
        <FeaturedProducts 
          products={products}
          navigateToProductDetail={navigateToProductDetail}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
