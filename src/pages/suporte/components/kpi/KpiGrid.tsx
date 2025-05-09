
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

interface KpiGridProps {
  stats: SupportStats;
}

const KpiGrid: React.FC<KpiGridProps> = ({ stats }) => {
  // Calcular KPIs com base nos dados existentes
  const completedExitsCount = stats.monthlyOrders.reduce((sum, month) => sum + month.completedExits, 0);
  const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
  
  // ROI (Retorno sobre o Investimento) = (Lucro / Valor de Compras) × 100
  const roi = stats.totalSpent > 0 ? (stats.profit / stats.totalSpent) * 100 : 0;
  
  // Margem de Lucro = (Lucro / Valor de Vendas) × 100
  const profitMargin = stats.profitMargin; // Já calculado no sistema
  
  // Taxa de Conversão de Vendas = (Número de Vendas / Número de Clientes) × 100
  const salesConversionRate = stats.clientsCount > 0 ? (completedExitsCount / stats.clientsCount) * 100 : 0;
  
  // Valor Médio de Compra = Valor de Compras / Número de Compras
  const averagePurchaseValue = totalEntries > 0 ? stats.totalSpent / totalEntries : 0;
  
  // Valor Médio de Venda = Valor de Vendas / Número de Vendas
  const averageSaleValue = completedExitsCount > 0 ? stats.totalSales / completedExitsCount : 0;
  
  // Lucro Total = Valor de Vendas - Valor de Compras
  const totalProfit = stats.profit; // Já calculado no sistema
  
  // Lucro Médio por Venda = Lucro / Número de Vendas
  const averageProfitPerSale = completedExitsCount > 0 ? stats.profit / completedExitsCount : 0;
  
  // Lucro por Cliente = Lucro / Número de Clientes
  const profitPerClient = stats.clientsCount > 0 ? stats.profit / stats.clientsCount : 0;

  const kpiData = [
    {
      title: "ROI",
      value: roi,
      icon: <TrendingUp />,
      tooltipText: "(Lucro / Valor de Compras) × 100",
      isPercentage: true,
      iconColor: "text-green-500"
    },
    {
      title: "Margem de Lucro",
      value: profitMargin,
      icon: <Percent />,
      tooltipText: "(Lucro / Valor de Vendas) × 100",
      isPercentage: true,
      iconColor: "text-blue-500"
    },
    {
      title: "Taxa de Conversão",
      value: salesConversionRate,
      icon: <PieChart />,
      tooltipText: "(Vendas / Clientes) × 100",
      isPercentage: true,
      iconColor: "text-purple-500"
    },
    {
      title: "Valor Médio de Compra",
      value: averagePurchaseValue,
      icon: <ShoppingCart />,
      tooltipText: "Valor de Compras / Número de Compras",
      iconColor: "text-orange-500"
    },
    {
      title: "Valor Médio de Venda",
      value: averageSaleValue,
      icon: <DollarSign />,
      tooltipText: "Valor de Vendas / Número de Vendas",
      iconColor: "text-green-500"
    },
    {
      title: "Lucro Total",
      value: totalProfit,
      icon: <Coins />,
      tooltipText: "Valor de Vendas - Valor de Compras",
      iconColor: "text-green-500"
    },
    {
      title: "Lucro Médio por Venda",
      value: averageProfitPerSale,
      icon: <BarChart />,
      tooltipText: "Lucro / Número de Vendas",
      iconColor: "text-blue-500"
    },
    {
      title: "Lucro por Cliente",
      value: profitPerClient,
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
