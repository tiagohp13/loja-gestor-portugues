import React, { useState, useMemo, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardOptimized } from "./dashboard/hooks/useDashboardOptimized";
import PageHeader from "../components/ui/PageHeader";
import QuickActions from "@/components/ui/QuickActions";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import SummaryCardSkeleton from "@/components/ui/SummaryCardSkeleton";
import { WidgetConfig } from "@/components/ui/DashboardCustomization/types";

// Lazy load heavy components for better performance
const SalesAndPurchasesChart = lazy(() => import("./dashboard/components/SalesAndPurchasesChart"));
const LowStockProducts = lazy(() => import("./dashboard/components/LowStockProducts"));
const InsufficientStockOrders = lazy(() => import("./dashboard/components/InsufficientStockOrders"));
const PendingOrders = lazy(() => import("./dashboard/components/PendingOrders")); // já com as colunas completas
const SummaryCards = lazy(() => import("./suporte/components/SummaryCards"));
const KPIPanel = lazy(() => import("@/components/statistics/KPIPanel"));

const defaultDashboardConfig: WidgetConfig[] = [
  { id: "quick-actions", title: "Ações Rápidas", order: 0, enabled: true },
  { id: "summary-cards", title: "Cartões de Resumo", order: 1, enabled: true },
  { id: "sales-purchases-chart", title: "Resumo Financeiro", order: 2, enabled: true },
  { id: "pending-orders", title: "Encomendas Pendentes", order: 3, enabled: true },
  { id: "low-stock-products", title: "Produtos com Stock Baixo", order: 4, enabled: true },
  { id: "insufficient-stock-orders", title: "Encomendas com Stock Insuficiente", order: 5, enabled: true },
  { id: "kpi-panel", title: "Indicadores de Performance", order: 6, enabled: true },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Single optimized hook with all data fetched in parallel
  const {
    isLoading,
    products,
    orders,
    monthlyData,
    lowStockProducts,
    kpis,
    kpiDeltas,
    supportStats,
    insufficientStockItems,
    pendingOrders: filteredPendingOrders
  } = useDashboardOptimized();

  const [dashboardConfig] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem("dashboard-layout-config");
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.dashboard) return cfg.dashboard;
      } catch {
        // ignore parse errors
      }
    }
    return defaultDashboardConfig;
  });

  const navigateToProductDetail = (id: string) => navigate(`/produtos/${id}`);
  const navigateToClientDetail = (id: string) => navigate(`/clientes/detalhe/${id}`);
  const navigateToOrderDetail = (id: string) => navigate(`/encomendas/${id}`);

  const componentMap: { [key: string]: React.ReactNode } = useMemo(
    () => ({
      "quick-actions": <QuickActions />,
      "summary-cards": (
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <SummaryCardSkeleton key={i} />)}
          </div>
        }>
          <SummaryCards stats={supportStats} isLoading={isLoading} deltas={kpiDeltas} />
        </Suspense>
      ),
      "sales-purchases-chart": (
        <Suspense fallback={<ChartSkeleton />}>
          <SalesAndPurchasesChart chartData={monthlyData} isLoading={isLoading} />
        </Suspense>
      ),
      "pending-orders": (
        <Suspense fallback={<TableSkeleton title="Encomendas Pendentes" rows={3} columns={5} />}>
          <PendingOrders
            pendingOrders={filteredPendingOrders}
            navigateToOrderDetail={navigateToOrderDetail}
            navigateToClientDetail={navigateToClientDetail}
          />
        </Suspense>
      ),
      "low-stock-products": (
        <Suspense fallback={<TableSkeleton title="Produtos com Stock Baixo" rows={3} columns={3} />}>
          <LowStockProducts lowStockProducts={lowStockProducts} navigateToProductDetail={navigateToProductDetail} />
        </Suspense>
      ),
      "insufficient-stock-orders": (
        <Suspense fallback={<TableSkeleton title="Encomendas com Stock Insuficiente" rows={3} columns={5} />}>
          <InsufficientStockOrders
            insufficientItems={insufficientStockItems}
            navigateToProductDetail={navigateToProductDetail}
            navigateToOrderDetail={navigateToOrderDetail}
            navigateToClientDetail={navigateToClientDetail}
          />
        </Suspense>
      ),
      "kpi-panel": (
        <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
          <KPIPanel title="Indicadores de Performance" description="Principais KPIs do negócio" kpis={kpis} />
        </Suspense>
      ),
    }),
    [
      supportStats,
      isLoading,
      monthlyData,
      lowStockProducts,
      filteredPendingOrders,
      insufficientStockItems,
      kpis,
      kpiDeltas,
      navigateToProductDetail,
      navigateToOrderDetail,
      navigateToClientDetail,
    ],
  );

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6 bg-background min-h-screen animate-fade-in">
      <PageHeader title="Dashboard" description="Vista geral do seu negócio" />

      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {/* Quick Actions, Summary Cards, Sales/Purchases Chart */}
        {componentMap["quick-actions"]}
        {componentMap["summary-cards"]}
        {componentMap["sales-purchases-chart"]}

        {/* Encomendas Pendentes: ocupa toda a largura */}
        <div>{componentMap["pending-orders"]}</div>

        {/* Produtos com Stock Baixo + Encomendas com Stock Insuficiente lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>{componentMap["low-stock-products"]}</div>
          <div>{componentMap["insufficient-stock-orders"]}</div>
        </div>

        {/* KPI Panel */}
        {componentMap["kpi-panel"]}
      </div>
    </div>
  );
};

export default DashboardPage;
