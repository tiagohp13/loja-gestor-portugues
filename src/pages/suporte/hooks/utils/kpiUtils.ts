
import { KPI } from '@/components/statistics/KPIPanel';
import { SupportStats } from '../../types/supportTypes';
import { calculateRoiPercent } from '@/pages/dashboard/hooks/utils/financialUtils';

export const generateKPIs = (stats: SupportStats): KPI[] => {
  // Calculate ROI using real data
  const roi = calculateRoiPercent(stats.profit, stats.totalSpent);
  
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
      name: "Ponto de Equilíbrio",
      value: 520,
      target: 500,
      unit: 'unidades',
      previousValue: 540,
      description: "Mede o volume de vendas necessário para cobrir os custos.",
      formula: "Custos fixos / (Preço venda unitário - Custo variável unitário)",
      belowTarget: false
    },
    {
      name: "Taxa de Conversão",
      value: 18.3,
      target: 20,
      unit: '%',
      isPercentage: true,
      previousValue: 17.5,
      description: "Mede a eficiência de transformar leads em clientes.",
      formula: "(Número de vendas / Número de leads) × 100",
      belowTarget: true
    },
    {
      name: "Churn Rate",
      value: 3.7,
      target: 5,
      unit: '%',
      isPercentage: true,
      previousValue: 4.2,
      description: "Mede a fidelidade dos clientes e a rotatividade.",
      formula: "(Clientes perdidos / Clientes no início do período) × 100",
      belowTarget: false
    },
    {
      name: "Lifetime Value",
      value: 3250,
      target: 3000,
      unit: '€',
      previousValue: 3100,
      description: "Mede o valor total que um cliente gera ao longo do relacionamento.",
      formula: "Valor médio de compra × Compras por ano × Anos de relação",
      belowTarget: false
    },
    {
      name: "NPS",
      value: 42,
      target: 50,
      unit: 'pontos',
      previousValue: 38,
      description: "Mede a satisfação e lealdade dos clientes.",
      formula: "% de promotores - % de detratores",
      belowTarget: true
    }
  ];
};
