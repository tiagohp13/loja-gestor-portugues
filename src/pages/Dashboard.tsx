
import React, { useState, useEffect } from 'react';
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
import { WidgetConfig } from '@/components/ui/DashboardCustomization';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: isLoadingSupportData, stats: supportStats, kpis } = useSupportData();
  
  const {
    products,
    orders,
    monthlyData,
    lowStockProducts,
    // Use new values that include expenses
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses
  } = useDashboardData();

  const [dashboardConfig, setDashboardConfig] = useState<WidgetConfig[]>([]);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('dashboard-layout-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.dashboard) {
          setDashboardConfig(config.dashboard);
        }
      }
    };
    
    loadConfig();
    window.addEventListener('storage', loadConfig);
    return () => window.removeEventListener('storage', loadConfig);
  }, []);
  
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

  const updatedStats = {
    ...supportStats,
    totalSpent: totalSpentWithExpenses,
    profit: totalProfitWithExpenses,
    profitMargin: profitMarginPercentWithExpenses
  };

  const componentMap: { [key: string]: React.ReactNode } = {
    'quick-actions': <QuickActions />,
    'summary-cards': <SummaryCards stats={updatedStats} />,
    'sales-purchases-chart': <div className="grid grid-cols-1 gap-6"><SalesAndPurchasesChart chartData={monthlyData} /></div>,
    'low-stock-products': (
      <LowStockProducts 
        lowStockProducts={lowStockProducts}
        navigateToProductDetail={navigateToProductDetail}
      />
    ),
    'pending-orders': (
      <PendingOrders 
        pendingOrders={pendingOrders}
        navigateToOrderDetail={navigateToOrderDetail}
        navigateToClientDetail={navigateToClientDetail}
      />
    ),
    'insufficient-stock-orders': (
      <InsufficientStockOrders 
        insufficientItems={insufficientStockItems}
        navigateToProductDetail={navigateToProductDetail}
        navigateToOrderDetail={navigateToOrderDetail}
        navigateToClientDetail={navigateToClientDetail}
      />
    ),
    'kpi-panel': (
      <KPIPanel 
        title="Indicadores de Performance" 
        description="Principais KPIs do negócio" 
        kpis={kpis} 
      />
    )
  };

  const sortedEnabledWidgets = dashboardConfig
    .filter(widget => widget.enabled)
    .sort((a, b) => a.order - b.order);

  const singleColumnWidgets = ['quick-actions', 'summary-cards', 'sales-purchases-chart', 'insufficient-stock-orders', 'kpi-panel'];
  
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
    <div className="container mx-auto px-4 py-6 bg-background min-h-screen">
      <PageHeader 
        title="Dashboard" 
        description="Vista geral do seu negócio"
      />
      
      <div className="space-y-6">
        {groupedWidgets.map((group, groupIndex) => {
          if (group.length > 1) {
            return (
              <div key={groupIndex} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default DashboardPage;
