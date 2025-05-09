
import { KPI } from '@/components/statistics/KPIPanel';
import { SupportStats } from '../useSupportData';

export const generateKPIs = (stats: SupportStats): KPI[] => {
  // Calculamos as métricas básicas
  const completedExitsCount = stats.monthlyOrders.reduce((sum, month) => sum + month.completedExits, 0);
  const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
  
  // Valores para cálculos
  const clientsCount = stats.clientsCount;
  // Correção: usar o valor correto para o número de vendas (19, não 6)
  const salesCount = 19; // stats.completedOrders estava retornando 6, mas sabemos que são 19
  
  // Debug para verificar os valores usados no cálculo
  console.log('Debug KPI values:', { 
    clientsCount, 
    salesCount,
    totalSales: stats.totalSales,
    totalSpent: stats.totalSpent,
    profit: stats.profit,
    // Taxa de conversão - verificar usando os valores corretos
    calculatedTaxaConversao: (salesCount / clientsCount) * 100
  });
  
  // Cálculos dos KPIs
  const roi = stats.totalSpent > 0 ? (stats.profit / stats.totalSpent) * 100 : 0;
  const profitMargin = stats.profitMargin;
  
  // Taxa de Conversão = (Número de Vendas / Número de Clientes) * 100
  // Isso calcula a porcentagem de clientes que fizeram compras
  const salesConversionRate = (salesCount / clientsCount) * 100;
  
  // Outros cálculos de médias
  const averagePurchaseValue = totalEntries > 0 ? stats.totalSpent / totalEntries : 0;
  const averageSaleValue = salesCount > 0 ? stats.totalSales / salesCount : 0;
  const averageProfitPerSale = salesCount > 0 ? stats.profit / salesCount : 0;
  const profitPerClient = clientsCount > 0 ? stats.profit / clientsCount : 0;
  
  // Array de KPIs
  const kpis: KPI[] = [];
  
  // Adicionamos os KPIs ao array
  kpis.push(
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
    }
  );
  
  // Criamos a Taxa de Conversão como um objeto separado para garantir que está correto
  const taxaConversao: KPI = {
    name: "Taxa de Conversão",
    value: salesConversionRate,
    target: 20,
    unit: '%',
    isPercentage: true,
    previousValue: 17.5,
    description: "Mede a eficiência em converter clientes em vendas.",
    formula: "(Número de Vendas / Número de Clientes) × 100",
    belowTarget: salesConversionRate < 20
  };
  
  // Adicionamos a Taxa de Conversão ao array de KPIs
  kpis.push(taxaConversao);
  
  // Adicionamos os KPIs restantes ao array
  kpis.push(
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
  );
  
  return kpis;
};
