
import { KPI } from '@/components/statistics/KPIPanel';
import { SupportStats } from '../useSupportData';

export const generateKPIs = (stats: SupportStats): KPI[] => {
  // Since we can't use hooks directly in regular functions, we'll calculate the KPIs directly here
  // This is similar to the logic in useKpiCalculations but for a different output format
  
  // Calculate basic metrics
  const completedExitsCount = stats.monthlyOrders.reduce((sum, month) => sum + month.completedExits, 0);
  const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
  
  // Calculate KPIs
  const roi = stats.totalSpent > 0 ? (stats.profit / stats.totalSpent) * 100 : 0;
  
  // Correct calculation for Taxa de Conversão - divide total sales by total clients and multiply by 100
  const salesConversionRate = stats.clientsCount > 0 ? (completedExitsCount / stats.clientsCount) * 100 : 0;
  
  const averagePurchaseValue = totalEntries > 0 ? stats.totalSpent / totalEntries : 0;
  const averageSaleValue = completedExitsCount > 0 ? stats.totalSales / completedExitsCount : 0;
  const averageProfitPerSale = completedExitsCount > 0 ? stats.profit / completedExitsCount : 0;
  const profitPerClient = stats.clientsCount > 0 ? stats.profit / stats.clientsCount : 0;
  
  return [
    {
      name: "ROI",
      value: roi,
      target: 40,
      unit: '%',
      isPercentage: true,
      previousValue: 30.1,
      description: "Mede o retorno em relação ao custo de investimento.",
      formula: "(Lucro / Custo) × 100",
      belowTarget: roi < 40
    },
    {
      name: "Margem de Lucro",
      value: stats.profitMargin,
      target: 25,
      unit: '%',
      isPercentage: true,
      previousValue: 25.2,
      description: "Mede a rentabilidade da empresa.",
      formula: "(Lucro / Receita) × 100",
      belowTarget: stats.profitMargin < 25
    },
    {
      name: "Taxa de Conversão",
      value: salesConversionRate,
      target: 20,
      unit: '%',
      isPercentage: true,
      previousValue: 17.5,
      description: "Mede a eficiência de transformar clientes em vendas.",
      formula: "(Número de Vendas / Número de Clientes) × 100",
      belowTarget: salesConversionRate < 20
    },
    {
      name: "Valor Médio de Compra",
      value: averagePurchaseValue,
      target: 500,
      unit: '€',
      isPercentage: false,
      previousValue: 450,
      description: "Valor médio gasto em cada compra a fornecedores.",
      formula: "Valor de Compras / Número de Compras",
      belowTarget: false
    },
    {
      name: "Valor Médio de Venda",
      value: averageSaleValue,
      target: 600,
      unit: '€',
      isPercentage: false,
      previousValue: 550,
      description: "Valor médio recebido em cada venda a clientes.",
      formula: "Valor de Vendas / Número de Vendas",
      belowTarget: averageSaleValue < 600
    },
    {
      name: "Lucro Médio por Venda",
      value: averageProfitPerSale,
      target: 200,
      unit: '€',
      isPercentage: false,
      previousValue: 180,
      description: "Lucro médio gerado em cada venda.",
      formula: "Lucro / Número de Vendas",
      belowTarget: averageProfitPerSale < 200
    },
    {
      name: "Lucro Total",
      value: stats.profit,
      target: 10000,
      unit: '€',
      isPercentage: false,
      previousValue: 9500,
      description: "Lucro total gerado no período.",
      formula: "Valor de Vendas - Valor de Compras",
      belowTarget: stats.profit < 10000
    },
    {
      name: "Lucro por Cliente",
      value: profitPerClient,
      target: 800,
      unit: '€',
      isPercentage: false,
      previousValue: 750,
      description: "Lucro médio gerado por cada cliente.",
      formula: "Lucro / Número de Clientes",
      belowTarget: profitPerClient < 800
    }
  ];
};

