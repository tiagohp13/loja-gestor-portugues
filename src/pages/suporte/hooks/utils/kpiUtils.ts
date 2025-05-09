
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
    }
    // Removed: Ponto de Equilíbrio, Taxa de Conversão, Churn Rate, Lifetime Value, and NPS
  ];
};
