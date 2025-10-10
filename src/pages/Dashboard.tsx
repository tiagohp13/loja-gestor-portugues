import React, { useState, useMemo, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";
import { useSupportData } from "./suporte/hooks/useSupportData";
import PageHeader from "../components/ui/PageHeader";
import QuickActions from "@/components/ui/QuickActions";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
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
  const { isLoading: isLoadingSupportData, stats: supportStats, kpis } = useSupportData();

  const {
    products,
    orders,
    monthlyData,
    lowStockProducts,
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses,
  } = useDashboardData();

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

  const { insufficientStockItems, pendingOrders: filteredPendingOrders } = useMemo(() => {
    const findInsufficientStockOrders = (orders: any[], products: any[]) => {
      return orders.reduce((acc: any[], order) => {
        if (order.convertedToStockExitId || order.status === "deleted") return acc;
        order.items.forEach((item: any) => {
          const product = products.find((p) => p.id === item.productId);
          if (product && product.currentStock < item.quantity) {
            acc.push({ product, order, item, shortfall: item.quantity - product.currentStock });
          }
        });
        return acc;
      }, []);
    };
    return {
      insufficientStockItems: findInsufficientStockOrders(orders, products),
      pendingOrders: orders.filter((order) => !order.convertedToStockExitId && order.status !== "deleted"),
    };
  }, [orders, products]);

  const navigateToProductDetail = (id: string) => navigate(`/produtos/${id}`);
  const navigateToClientDetail = (id: string) => navigate(`/clientes/detalhe/${id}`);
  const navigateToOrderDetail = (id: string) => navigate(`/encomendas/${id}`);

  const isLoading = isLoadingSupportData;

  const updatedStats = useMemo(
    () => ({
      ...supportStats,
      totalSpent: totalSpentWithExpenses,
      profit: totalProfitWithExpenses,
      profitMargin: profitMarginPercentWithExpenses,
    }),
    [supportStats, totalSpentWithExpenses, totalProfitWithExpenses, profitMarginPercentWithExpenses],
  );

  const componentMap: { [key: string]: React.ReactNode } = useMemo(
    () => ({
      "quick-actions": <QuickActions />,
      "summary-cards": (
        <Suspense fallback={<TableSkeleton title="Cartões de Resumo" rows={2} columns={2} />}>
          <SummaryCards stats={updatedStats} isLoading={isLoading} />
        </Suspense>
      ),
      "sales-purchases-chart": (
        <Suspense fallback={<ChartSkeleton />}>
          <SalesAndPurchasesChart chartData={monthlyData} isLoading={isLoading} />
        </Suspense>
      ),
      "pending-orders": (
        <Suspense fallback={<TableSkeleton title="Encomendas Pendentes" rows={4} columns={7} />}>
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
        <Suspense fallback={<TableSkeleton title="Indicadores de Performance" rows={4} columns={2} />}>
          <KPIPanel title="Indicadores de Performance" description="Principais KPIs do negócio" kpis={kpis} />
        </Suspense>
      ),
    }),
    [
      updatedStats,
      isLoading,
      monthlyData,
      lowStockProducts,
      filteredPendingOrders,
      insufficientStockItems,
      kpis,
      navigateToProductDetail,
      navigateToOrderDetail,
      navigateToClientDetail,
    ],
  );

  return (
    <div className="container mx-auto px-4 py-6 bg-background min-h-screen animate-fade-in">
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
