import React, { useState, useMemo, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardOptimized } from "./dashboard/hooks/useDashboardOptimized";
import PageHeader from "../components/ui/PageHeader";
import QuickActions from "@/components/ui/QuickActions";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import SummaryCardSkeleton from "@/components/ui/SummaryCardSkeleton";
import { WidgetConfig } from "@/components/ui/DashboardCustomization/types";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, BarChart3, Clock, Infinity } from "lucide-react";

type DashboardPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

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
  const [periodFilter, setPeriodFilter] = useState<DashboardPeriod>('month');
  
  // Single optimized hook with all data fetched in parallel - now with period filter
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
  } = useDashboardOptimized(periodFilter);

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

  const periodOptions: Array<{ value: DashboardPeriod; label: string; icon: React.ComponentType<any> }> = [
    { value: 'today', label: 'Hoje', icon: Clock },
    { value: 'week', label: 'Semana', icon: Calendar },
    { value: 'month', label: 'Mês', icon: TrendingUp },
    { value: 'year', label: 'Ano', icon: BarChart3 },
    { value: 'all', label: 'Sempre', icon: Infinity },
  ];

  return (
    <div className="container mx-auto px-4 py-6 bg-background min-h-screen animate-fade-in">
      <PageHeader title="Dashboard" description="Vista geral do seu negócio" />

      {/* Period Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {periodOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={periodFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodFilter(option.value)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </Button>
          );
        })}
      </div>


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
