
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useDashboardData } from './dashboard/hooks/useDashboardData';
import DashboardSummaryCards from './dashboard/components/DashboardSummaryCards';
import LowStockProducts from './dashboard/components/LowStockProducts';
import PendingOrders from './dashboard/components/PendingOrders';
import RecentTransactions from './dashboard/components/RecentTransactions';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Dashboard = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { products, clients, suppliers } = useData();
  const { 
    lowStockProducts, 
    pendingOrders, 
    recentTransactions, 
    totalStockValue,
    navigateToProductDetail,
    navigateToClientDetail,
    navigateToSupplierDetail,
    navigateToOrderDetail,
    ensureDate
  } = useDashboardData();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gestorApp-blue">Dashboard</h1>
      
      <DashboardSummaryCards 
        products={products} 
        clients={clients}
        suppliers={suppliers}
        totalStockValue={totalStockValue}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockProducts 
          lowStockProducts={lowStockProducts}
          navigateToProductDetail={navigateToProductDetail}
        />
        <PendingOrders 
          pendingOrders={pendingOrders}
          navigateToOrderDetail={navigateToOrderDetail}
          navigateToClientDetail={navigateToClientDetail}
        />
      </div>
      
      <RecentTransactions 
        recentTransactions={recentTransactions}
        navigateToProductDetail={navigateToProductDetail}
        navigateToClientDetail={navigateToClientDetail}
        navigateToSupplierDetail={navigateToSupplierDetail}
        ensureDate={ensureDate}
      />
    </div>
  );
};

export default Dashboard;
