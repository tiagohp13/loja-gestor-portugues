
import React from 'react';
import { 
  TrendingUp, 
  BarChart, 
  PieChart, 
  DollarSign,
  Percent,
  Users,
  ShoppingCart,
  Coins
} from 'lucide-react';
import KpiCard from './KpiCard';
import { SupportStats } from '../../hooks/useSupportData';
import { useKpiCalculations } from '../../hooks/useKpiCalculations';

interface KpiGridProps {
  stats: SupportStats;
}

const KpiGrid: React.FC<KpiGridProps> = ({ stats }) => {
  // Use our new hook to get all the calculated KPIs
  const kpis = useKpiCalculations(stats);

  const kpiData = [
    {
      title: "ROI",
      value: kpis.roi,
      icon: <TrendingUp />,
      tooltipText: "(Lucro / Valor de Compras) × 100",
      isPercentage: true,
      iconColor: "text-green-500"
    },
    {
      title: "Margem de Lucro",
      value: kpis.profitMargin,
      icon: <Percent />,
      tooltipText: "(Lucro / Valor de Vendas) × 100",
      isPercentage: true,
      iconColor: "text-blue-500"
    },
    {
      title: "Taxa de Conversão",
      value: kpis.salesConversionRate,
      icon: <PieChart />,
      tooltipText: "(Vendas / Clientes) × 100",
      isPercentage: true,
      iconColor: "text-purple-500"
    },
    {
      title: "Valor Médio de Compra",
      value: kpis.averagePurchaseValue,
      icon: <ShoppingCart />,
      tooltipText: "Valor de Compras / Número de Compras",
      iconColor: "text-orange-500"
    },
    {
      title: "Valor Médio de Venda",
      value: kpis.averageSaleValue,
      icon: <DollarSign />,
      tooltipText: "Valor de Vendas / Número de Vendas",
      iconColor: "text-green-500"
    },
    {
      title: "Lucro Total",
      value: kpis.totalProfit,
      icon: <Coins />,
      tooltipText: "Valor de Vendas - Valor de Compras",
      iconColor: "text-green-500"
    },
    {
      title: "Lucro Médio por Venda",
      value: kpis.averageProfitPerSale,
      icon: <BarChart />,
      tooltipText: "Lucro / Número de Vendas",
      iconColor: "text-blue-500"
    },
    {
      title: "Lucro por Cliente",
      value: kpis.profitPerClient,
      icon: <Users />,
      tooltipText: "Lucro / Número de Clientes",
      iconColor: "text-indigo-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <KpiCard 
          key={index}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          tooltipText={kpi.tooltipText}
          isPercentage={kpi.isPercentage}
          iconColor={kpi.iconColor}
        />
      ))}
    </div>
  );
};

export default KpiGrid;
