
import { ChildConfig, LayoutConfig } from './types';

// Default Configurations
export const defaultQuickActions: ChildConfig[] = [
  { id: 'product', title: 'Novo Produto', enabled: true, order: 0, color: 'bg-orange-600' },
  { id: 'client', title: 'Novo Cliente', enabled: true, order: 1, color: 'bg-purple-600' },
  { id: 'order', title: 'Nova Encomenda', enabled: true, order: 2, color: 'bg-teal-600' },
  { id: 'purchase', title: 'Nova Compra', enabled: true, order: 3, color: 'bg-blue-600' },
  { id: 'sale', title: 'Nova Venda', enabled: true, order: 4, color: 'bg-green-600' },
  { id: 'expense', title: 'Nova Despesa', enabled: true, order: 5, color: 'bg-yellow-500' }
];

export const defaultSummaryCards: ChildConfig[] = [
  { id: 'totalSales', title: 'Total de Vendas', enabled: true, order: 0 },
  { id: 'totalSpent', title: 'Total Gasto', enabled: true, order: 1 },
  { id: 'profit', title: 'Lucro', enabled: true, order: 2 },
  { id: 'profitMargin', title: 'Margem de Lucro', enabled: true, order: 3 }
];

export const defaultLayoutConfig: LayoutConfig = {
  dashboard: [
    { id: 'quick-actions', title: 'Botões de Ações Rápidas', enabled: true, order: 0, children: defaultQuickActions },
    { id: 'summary-cards', title: 'Cartões de Métricas', enabled: true, order: 1, children: defaultSummaryCards },
    { id: 'sales-purchases-chart', title: 'Gráfico "Resumo Financeiro"', enabled: true, order: 2 },
    { id: 'low-stock-products', title: 'Produtos com Stock Baixo', enabled: true, order: 3 },
    { id: 'pending-orders', title: 'Encomendas Pendentes', enabled: true, order: 4 },
    { id: 'insufficient-stock-orders', title: 'Encomendas com Stock Insuficiente', enabled: true, order: 5 },
    { id: 'kpi-panel', title: 'Indicadores de Performance', enabled: true, order: 6 },
  ],
  statistics: [
    { id: 'kpi-grid', title: 'Grelha de KPIs', enabled: true, order: 0 },
    { id: 'featured-products', title: 'Tabela de Top Produtos', enabled: true, order: 1 },
    { id: 'support-chart-resumo', title: 'Gráfico de Resumo Financeiro', enabled: true, order: 2 },
    { id: 'dashboard-statistics', title: 'Estatísticas do Dashboard', enabled: true, order: 3 },
    { id: 'recent-transactions', title: 'Transações Recentes', enabled: true, order: 4 },
  ],
};
