
import { KPI } from '@/components/statistics/KPIPanel';
import { SupportStats } from '../useSupportData';

// Helper function to safely convert to number and handle null/undefined/NaN
const safeNumber = (value: number | null | undefined, defaultValue: number = 0): number => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

export const generateKPIs = (stats: SupportStats): KPI[] => {
  // Calculamos as métricas básicas
  const completedExitsCount = stats.monthlyOrders.reduce((sum, month) => sum + month.completedExits, 0);
  const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
  
  // Valores para cálculos (com guards de segurança)
  const clientsCount = safeNumber(stats.clientsCount, 1); // Evitar divisão por zero
  const salesCount = safeNumber(stats.completedOrders, 0);
  const totalSpent = safeNumber(stats.totalSpent, 0);
  const totalSales = safeNumber(stats.totalSales, 0);
  const profit = safeNumber(stats.profit, 0);
  
  // Cálculos dos KPIs com valores seguros
  const roi = totalSpent > 0 ? (profit / totalSpent) * 100 : 0;
  const profitMargin = safeNumber(stats.profitMargin, 0);
  
  // Taxa de Conversão = (Número de Vendas / Número de Clientes) * 100
  // Isso calcula a porcentagem de clientes que fizeram compras
  const salesConversionRate = (salesCount / clientsCount) * 100;
  
  // CORREÇÃO: Valor Médio de Compra agora inclui despesas
  // Numerador: Total Gasto (compras + despesas) - já está correto em stats.totalSpent
  // Denominador: Número de Compras + Número de Despesas
  const totalTransactions = totalEntries + (stats.numberOfExpenses || 0);
  
  // Valor Médio de Compra = (Total Compras + Total Despesas) / (Número de Compras + Número de Despesas)
  const averagePurchaseValue = totalTransactions > 0 ? totalSpent / totalTransactions : 0;
  
  // Valor Médio de Venda = Valor de Vendas / Número de Vendas
  const averageSaleValue = salesCount > 0 ? totalSales / salesCount : 0;
  
  // Lucro Médio por Venda = Lucro / Número de Vendas
  const averageProfitPerSale = salesCount > 0 ? profit / salesCount : 0;
  
  const profitPerClient = clientsCount > 0 ? profit / clientsCount : 0;
  
  // Array de KPIs
  const kpis: KPI[] = [];
  
  // Adicionamos os KPIs ao array com valores seguros e arredondados
  kpis.push(
    {
      name: "ROI",
      value: safeNumber(Number(roi.toFixed(2))),
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
      value: safeNumber(Number(profitMargin.toFixed(2))),
      target: 25,
      unit: '%',
      isPercentage: true,
      previousValue: 25.2,
      description: "Mede a rentabilidade da empresa.",
      formula: "(Lucro / Receita) × 100",
      belowTarget: profitMargin < 25
    }
  );
  
  // Criamos a Taxa de Conversão como um objeto separado para garantir que está correto
  const taxaConversao: KPI = {
    name: "Taxa de Conversão",
    value: safeNumber(Number(salesConversionRate.toFixed(2))),
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
  
  // Valor Médio de Compra CORRIGIDO - agora inclui despesas no denominador
  const valorMedioCompra: KPI = {
    name: "Valor Médio de Compra",
    value: safeNumber(Number(averagePurchaseValue.toFixed(2))),
    target: 500,
    unit: '€',
    isPercentage: false,
    previousValue: 450,
    description: "Valor médio gasto em cada transação (compras + despesas).",
    formula: "(Total Compras + Total Despesas) / (Número de Compras + Número de Despesas)",
    belowTarget: averagePurchaseValue > 500, // Lógica inversa: acima da meta é ruim
    isInverseKPI: true // Marcador para indicar que este KPI tem lógica inversa
  };
  
  // Adicionamos o Valor Médio de Compra corrigido ao array de KPIs
  kpis.push(valorMedioCompra);
  
  // Adicionamos os KPIs restantes ao array com valores seguros e arredondados
  kpis.push(
    {
      name: "Valor Médio de Venda",
      value: safeNumber(Number(averageSaleValue.toFixed(2))),
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
      value: safeNumber(Number(averageProfitPerSale.toFixed(2))),
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
      value: safeNumber(Number(profit.toFixed(2))),
      target: 10000,
      unit: '€',
      isPercentage: false,
      previousValue: 9500,
      description: "Lucro total gerado no período.",
      formula: "Valor de Vendas - (Valor de Compras + Despesas)",
      belowTarget: profit < 10000
    },
    {
      name: "Lucro por Cliente",
      value: safeNumber(Number(profitPerClient.toFixed(2))),
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
