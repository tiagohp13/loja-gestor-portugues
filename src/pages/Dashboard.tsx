
import React from 'react';
import { useData } from '../contexts/DataContext';
import DashboardSummaryCards from './dashboard/components/DashboardSummaryCards';
import LowStockProducts from './dashboard/components/LowStockProducts';
import PendingOrders from './dashboard/components/PendingOrders';
import RecentTransactions from './dashboard/components/RecentTransactions';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Dashboard = () => {
  useScrollToTop();
  
  const { products, stockEntries, stockExits, orders } = useData();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gestorApp-blue">Dashboard</h1>
      
      <DashboardSummaryCards 
        products={products} 
        stockEntries={stockEntries} 
        stockExits={stockExits} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockProducts products={products} />
        <PendingOrders orders={orders} />
      </div>
      
      <RecentTransactions stockEntries={stockEntries} stockExits={stockExits} />
    </div>
  );
};

export default Dashboard;
