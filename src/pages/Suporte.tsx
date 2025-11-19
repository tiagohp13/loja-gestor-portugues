import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";
import { useSupportData } from "./suporte/hooks/useSupportData";
import SupportChart from "./suporte/components/SupportChart";
import MetricsCards from "./suporte/components/MetricsCards";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";
import { useClients } from "@/contexts/ClientsContext";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import { useStock } from "@/contexts/StockContext";
import FeaturedProducts from "./dashboard/components/FeaturedProducts";
import DashboardStatistics from "./dashboard/components/DashboardStatistics";
import RecentTransactions from "./dashboard/components/RecentTransactions";
import { WidgetConfig } from "@/components/ui/DashboardCustomization/types";

// Default configuration for statistics widgets - reordered to show chart before products
const defaultStatisticsConfig: WidgetConfig[] = [
  { id: "kpi-grid", title: "KPIs", order: 0, enabled: true },
  { id: "support-chart-resumo", title: "Resumo Financeiro", order: 1, enabled: true },
  { id: "featured-products", title: "Produtos em Destaque", order: 2, enabled: true },
  { id: "dashboard-statistics", title: "Estatísticas Gerais", order: 3, enabled: true },
  { id: "recent-transactions", title: "Transações Recentes", order: 4, enabled: true },
];

const Suporte: React.FC = () => {
  useScrollToTop();
  const navigate = useNavigate();

  const { isLoading: isSupportDataLoading, stats } = useSupportData();
  const {
    products,
    totalSalesValue,
    totalPurchaseValue,
    totalStockValue,
    totalSpentWithExpenses,
    totalProfitWithExpenses,
    profitMarginPercentWithExpenses,
    roiValueWithExpenses,
    roiPercentWithExpenses,
    lowStockProducts,
    monthlyData,
  } = useDashboardData();

  // Get additional data from separated contexts for Suporte page
  const { suppliers } = useSuppliersQuery();
  const { clients } = useClients();
  const { stockEntries, stockExits } = useStock();

  // Calculate derived values locally for this page
  const totalProfit = totalSalesValue - totalPurchaseValue;
  const profitMarginPercent = totalSalesValue > 0 ? (totalProfit / totalSalesValue) * 100 : 0;
  const roiValue = totalPurchaseValue > 0 ? totalProfit / totalPurchaseValue : 0;
  const roiPercent = totalPurchaseValue > 0 ? (totalProfit / totalPurchaseValue) * 100 : 0;

  // Calculate product sales from stockExits
  const productSales = stockExits
    .flatMap((exit) => exit.items)
    .reduce(
      (acc, item) => {
        const { productId, quantity } = item;
        if (!acc[productId]) {
          acc[productId] = 0;
        }
        acc[productId] += quantity;
        return acc;
      },
      {} as Record<string, number>,
    );

  // Find most sold product
  const mostSoldProduct = (() => {
    let mostSoldProductId = "";
    let mostSoldQuantity = 0;

    Object.entries(productSales).forEach(([productId, quantity]) => {
      if (quantity > mostSoldQuantity) {
        mostSoldProductId = productId;
        mostSoldQuantity = quantity;
      }
    });

    return products.find((p) => p.id === mostSoldProductId);
  })();

  // Find most frequent client
  const mostFrequentClient = (() => {
    const clientPurchases = stockExits.reduce(
      (acc, exit) => {
        const { clientId } = exit;
        if (!acc[clientId]) {
          acc[clientId] = 0;
        }
        acc[clientId] += 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    let mostFrequentClientId = "";
    let mostFrequentClientCount = 0;

    Object.entries(clientPurchases).forEach(([clientId, count]) => {
      if (count > mostFrequentClientCount) {
        mostFrequentClientId = clientId;
        mostFrequentClientCount = count;
      }
    });

    return clients.find((c) => c.id === mostFrequentClientId);
  })();

  // Find most used supplier
  const mostUsedSupplier = (() => {
    const supplierPurchases = stockEntries.reduce(
      (acc, entry) => {
        const { supplierId } = entry;
        if (!acc[supplierId]) {
          acc[supplierId] = 0;
        }
        acc[supplierId] += 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    let mostUsedSupplierId = "";
    let mostUsedSupplierCount = 0;

    Object.entries(supplierPurchases).forEach(([supplierId, count]) => {
      if (count > mostUsedSupplierCount) {
        mostUsedSupplierId = supplierId;
        mostUsedSupplierCount = count;
      }
    });

    return suppliers.find((s) => s.id === mostUsedSupplierId);
  })();

  // Create recent transactions
  const recentTransactions = (() => {
    const allTransactions = [
      ...stockEntries.flatMap((entry) =>
        entry.items.map((item) => ({
          id: entry.id,
          type: "entry" as const,
          productId: item.productId,
          product: products.find((p) => p.id === item.productId),
          entity: entry.supplierName || suppliers.find((s) => s.id === entry.supplierId)?.name || "Desconhecido",
          entityId: entry.supplierId,
          quantity: item.quantity,
          date: entry.date,
          value: item.quantity * item.purchasePrice,
        })),
      ),
      ...stockExits.flatMap((exit) =>
        exit.items.map((item) => ({
          id: exit.id,
          type: "exit" as const,
          productId: item.productId,
          product: products.find((p) => p.id === item.productId),
          entity: exit.clientName || clients.find((c) => c.id === exit.clientId)?.name || "Desconhecido",
          entityId: exit.clientId,
          quantity: item.quantity,
          date: exit.date,
          value: item.quantity * item.salePrice,
        })),
      ),
    ];

    return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  })();

  // Utility function
  const ensureDate = (dateInput: string | Date): Date => {
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  };

  // Initialize statistics configuration from localStorage or default
  const [statisticsConfig, setStatisticsConfig] = useState<WidgetConfig[]>(() => {
    const saved = null; // força sempre a usar defaultStatisticsConfig
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.statistics) {
          return cfg.statistics;
        }
      } catch {
        // ignore
      }
    }
    return defaultStatisticsConfig;
  });

  const navigateToProductDetail = (id: string) => navigate(`/produtos/${id}`);
  const navigateToClientDetail = (id: string) => navigate(`/clientes/${id}`);
  const navigateToSupplierDetail = (id: string) => navigate(`/fornecedores/${id}`);

  if (isSupportDataLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  const componentMap: { [key: string]: React.ReactNode } = {
    "kpi-grid": (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricsCards stats={stats} showSummaryCardsOnly />
      </div>
    ),
    "support-chart-resumo": (
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <SupportChart
          chartType="resumo"
          data={{
            monthlyData: stats.monthlyData,
            topProducts: stats.topProducts,
            topClients: stats.topClients,
            topSuppliers: stats.topSuppliers,
            lowStockProducts: stats.lowStockProducts,
            monthlyOrders: stats.monthlyOrders,
          }}
          isLoading={isSupportDataLoading}
          navigateToProduct={navigateToProductDetail}
        />
      </div>
    ),
    "featured-products": (
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <FeaturedProducts
          products={products}
          productSales={productSales}
          navigateToProductDetail={navigateToProductDetail}
          maxItems={5}
        />
      </div>
    ),
    "dashboard-statistics": (
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
        totalSpentWithExpenses={totalSpentWithExpenses}
        totalProfitWithExpenses={totalProfitWithExpenses}
        profitMarginPercentWithExpenses={profitMarginPercentWithExpenses}
        roiValueWithExpenses={roiValueWithExpenses}
        roiPercentWithExpenses={roiPercentWithExpenses}
        navigateToProductDetail={navigateToProductDetail}
        navigateToClientDetail={navigateToClientDetail}
        navigateToSupplierDetail={navigateToSupplierDetail}
      />
    ),
    "recent-transactions": (
      <RecentTransactions
        recentTransactions={recentTransactions}
        navigateToProductDetail={navigateToProductDetail}
        navigateToClientDetail={navigateToClientDetail}
        navigateToSupplierDetail={navigateToSupplierDetail}
        ensureDate={ensureDate}
      />
    ),
  };

  const sortedEnabledWidgets = statisticsConfig.filter((widget) => widget.enabled).sort((a, b) => a.order - b.order);

  const singleColumnWidgets = ["kpi-grid", "featured-products", "support-chart-resumo"];

  const groupedWidgets = sortedEnabledWidgets.reduce((acc, widget, index) => {
    if (singleColumnWidgets.includes(widget.id)) {
      acc.push([widget]);
    } else {
      const prev = sortedEnabledWidgets[index - 1];
      if (prev && !singleColumnWidgets.includes(prev.id) && acc[acc.length - 1].length === 1) {
        acc[acc.length - 1].push(widget);
      } else {
        acc.push([widget]);
      }
    }
    return acc;
  }, [] as WidgetConfig[][]);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Dashboard de Estatísticas" description="Visualize estatísticas importantes do seu negócio" />

      <div className="space-y-6">
        {groupedWidgets.map((group, idx) => (
          <div key={idx} className={`${group.length > 1 ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}`}>
            {group.map((w) => (
              <div key={w.id}>{componentMap[w.id]}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suporte;
